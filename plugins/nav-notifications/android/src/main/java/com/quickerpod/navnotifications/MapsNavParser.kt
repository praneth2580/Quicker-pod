package com.quickerpod.navnotifications

import android.app.Notification
import android.os.Build
import android.os.Bundle
import android.service.notification.StatusBarNotification
import android.text.SpannableString
import java.util.Locale
import java.util.regex.Pattern

/**
 * Best-effort parser for Google Maps (and similar) navigation notification text.
 * Maps layout IDs and extras change across versions — this focuses on title/text
 * extras plus common English (and a few localized) turn / distance phrases.
 */
object MapsNavParser {
    val MAPS_PACKAGES = setOf(
        "com.google.android.apps.maps",
        "com.google.android.apps.mapslite",
        "com.waze",
    )

    data class ParsedNav(
        val packageName: String,
        val title: String,
        val text: String,
        val turnText: String?,
        val distanceM: Int?,
        val etaSeconds: Int?,
        val maneuverName: String?,
        val streetName: String?,
        val rerouting: Boolean,
        val stopped: Boolean = false,
    )

    private val DISTANCE_PATTERN = Pattern.compile(
        "(?i)(\\d+(?:[.,]\\d+)?)\\s*(m|meter|meters|metre|metres|km|kilometer|kilometers|kilometre|kilometres|mi|mile|miles|ft|feet)\\b",
    )
    private val ETA_DURATION_PATTERN = Pattern.compile(
        "(?i)(\\d+)\\s*h(?:ours?)?\\s*(\\d+)\\s*min|(?:(\\d+)\\s*h(?:ours?)?)|(?:(\\d+)\\s*min(?:utes?)?)",
    )

    private data class ManeuverRule(val pattern: Pattern, val name: String)

    private val MANEUVER_RULES = listOf(
        ManeuverRule(Pattern.compile("(?i)\\bu[- ]?turn\\b"), "TURN_U_TURN_CLOCKWISE"),
        ManeuverRule(Pattern.compile("(?i)\\broundabout\\b.*\\bleft\\b|\\bleft\\b.*\\broundabout\\b"), "ROUNDABOUT_LEFT_CLOCKWISE"),
        ManeuverRule(Pattern.compile("(?i)\\broundabout\\b.*\\bright\\b|\\bright\\b.*\\broundabout\\b"), "ROUNDABOUT_RIGHT_CLOCKWISE"),
        ManeuverRule(Pattern.compile("(?i)\\broundabout\\b.*\\bstraight\\b|\\bexit\\b.*\\broundabout\\b|\\broundabout\\b"), "ROUNDABOUT_EXIT_CLOCKWISE"),
        ManeuverRule(Pattern.compile("(?i)\\bsharp\\s+left\\b"), "TURN_SHARP_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bsharp\\s+right\\b"), "TURN_SHARP_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bslight\\s+left\\b|\\bbear\\s+left\\b"), "TURN_SLIGHT_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bslight\\s+right\\b|\\bbear\\s+right\\b"), "TURN_SLIGHT_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bkeep\\s+left\\b"), "KEEP_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bkeep\\s+right\\b"), "KEEP_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bfork\\s+left\\b"), "FORK_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bfork\\s+right\\b"), "FORK_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bmerge\\s+left\\b|\\bmerge\\b.*\\bleft\\b"), "MERGE_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bmerge\\s+right\\b|\\bmerge\\b.*\\bright\\b"), "MERGE_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bon[- ]?ramp\\b.*\\bleft\\b|\\bleft\\b.*\\bon[- ]?ramp\\b"), "ON_RAMP_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bon[- ]?ramp\\b.*\\bright\\b|\\bright\\b.*\\bon[- ]?ramp\\b"), "ON_RAMP_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\boff[- ]?ramp\\b.*\\bleft\\b|\\bexit\\b.*\\bleft\\b"), "OFF_RAMP_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\boff[- ]?ramp\\b.*\\bright\\b|\\bexit\\b.*\\bright\\b"), "OFF_RAMP_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bturn\\s+left\\b|\\bleft\\s+turn\\b|\\bturn\\b.*\\bleft\\b"), "TURN_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bturn\\s+right\\b|\\bright\\s+turn\\b|\\bturn\\b.*\\bright\\b"), "TURN_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bdestination\\b.*\\bleft\\b|\\barrive\\b.*\\bleft\\b"), "DESTINATION_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bdestination\\b.*\\bright\\b|\\barrive\\b.*\\bright\\b"), "DESTINATION_RIGHT"),
        ManeuverRule(Pattern.compile("(?i)\\bdestination\\b|\\barriv(?:e|al)\\b|\\byou\\s+have\\s+arrived\\b"), "DESTINATION_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bdepart\\b|\\bhead\\b|\\bcontinue\\b|\\bstraight\\b|\\bgo\\s+straight\\b"), "STRAIGHT"),
        // Hindi / Hinglish fragments sometimes appear in India Maps builds
        ManeuverRule(Pattern.compile("(?i)\\bबायें\\b|\\bबाएं\\b|\\bleft\\b"), "TURN_LEFT"),
        ManeuverRule(Pattern.compile("(?i)\\bदायें\\b|\\bदाएं\\b|\\bright\\b"), "TURN_RIGHT"),
    )

    fun isNavigationPackage(packageName: String): Boolean =
        MAPS_PACKAGES.contains(packageName)

    fun parse(sbn: StatusBarNotification): ParsedNav? {
        if (!isNavigationPackage(sbn.packageName)) return null
        val notification = sbn.notification ?: return null
        val extras = notification.extras ?: Bundle()

        val title = charSeq(extras.getCharSequence(Notification.EXTRA_TITLE))
            .ifBlank { charSeq(extras.getCharSequence(Notification.EXTRA_TITLE_BIG)) }
        val text = listOf(
            charSeq(extras.getCharSequence(Notification.EXTRA_TEXT)),
            charSeq(extras.getCharSequence(Notification.EXTRA_BIG_TEXT)),
            charSeq(extras.getCharSequence(Notification.EXTRA_SUB_TEXT)),
            charSeq(extras.getCharSequence(Notification.EXTRA_INFO_TEXT)),
            charSeq(extras.getCharSequence(Notification.EXTRA_SUMMARY_TEXT)),
        ).filter { it.isNotBlank() }.distinct().joinToString(" · ")

        // Ignore non-nav Maps notifications (traffic alerts without a direction cue).
        val combined = "$title $text".trim()
        if (combined.isBlank()) return null

        val rerouting = combined.contains("rerout", ignoreCase = true) ||
            combined.contains("finding a route", ignoreCase = true) ||
            combined.contains("recalculat", ignoreCase = true)

        val distanceM = parseDistanceMeters(title) ?: parseDistanceMeters(combined)
        val etaSeconds = parseEtaSeconds(combined)
        val maneuverName = matchManeuver(text.ifBlank { title })
            ?: matchManeuver(combined)
        val turnText = text.ifBlank { title }.takeIf { it.isNotBlank() }
        val streetName = parseStreet(text) ?: parseStreet(title)

        // Require at least a distance or recognizable turn — reduces spam from Maps UI toasts.
        if (!rerouting && distanceM == null && maneuverName == null) {
            return null
        }

        return ParsedNav(
            packageName = sbn.packageName,
            title = title,
            text = text,
            turnText = turnText,
            distanceM = distanceM,
            etaSeconds = etaSeconds,
            maneuverName = maneuverName,
            streetName = streetName,
            rerouting = rerouting,
        )
    }

    fun stoppedEvent(packageName: String): ParsedNav =
        ParsedNav(
            packageName = packageName,
            title = "",
            text = "",
            turnText = null,
            distanceM = null,
            etaSeconds = null,
            maneuverName = null,
            streetName = null,
            rerouting = false,
            stopped = true,
        )

    private fun charSeq(value: CharSequence?): String {
        if (value == null) return ""
        return when (value) {
            is SpannableString -> value.toString()
            else -> value.toString()
        }.trim()
    }

    fun parseDistanceMeters(input: String): Int? {
        val matcher = DISTANCE_PATTERN.matcher(input)
        if (!matcher.find()) return null
        val raw = matcher.group(1)?.replace(',', '.') ?: return null
        val unit = matcher.group(2)?.lowercase(Locale.US) ?: return null
        val value = raw.toDoubleOrNull() ?: return null
        val meters = when {
            unit.startsWith("km") || unit.startsWith("kilomet") -> value * 1000.0
            unit.startsWith("mi") || unit.startsWith("mile") -> value * 1609.344
            unit.startsWith("ft") || unit.startsWith("feet") -> value * 0.3048
            else -> value // meters
        }
        return meters.toInt().coerceAtLeast(0)
    }

    fun parseEtaSeconds(input: String): Int? {
        val matcher = ETA_DURATION_PATTERN.matcher(input)
        if (!matcher.find()) return null
        val hMinH = matcher.group(1)
        val hMinM = matcher.group(2)
        if (hMinH != null && hMinM != null) {
            return hMinH.toInt() * 3600 + hMinM.toInt() * 60
        }
        val hours = matcher.group(3)?.toIntOrNull()
        if (hours != null) return hours * 3600
        val minutes = matcher.group(4)?.toIntOrNull()
        if (minutes != null) return minutes * 60
        return null
    }

    private val STREET_PATTERN = Pattern.compile(
        "(?i)\\b(?:onto|on to|on)\\s+([^·\\n]+)",
    )

    fun parseStreet(input: String): String? {
        if (input.isBlank()) return null
        val matcher = STREET_PATTERN.matcher(input)
        if (!matcher.find()) return null
        val street = matcher.group(1)
            ?.replace(Regex("(?i)\\s+\\d+(?:[.,]\\d+)?\\s*(?:m|km|mi|ft)\\b.*$"), "")
            ?.trim()
            ?.trim(',', '.', '-', ' ')
        if (street.isNullOrBlank() || street.length < 2) return null
        return street
    }

    fun matchManeuver(input: String): String? {
        if (input.isBlank()) return null
        for (rule in MANEUVER_RULES) {
            if (rule.pattern.matcher(input).find()) return rule.name
        }
        return null
    }
}
