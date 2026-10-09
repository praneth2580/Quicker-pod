package com.quickerpod.navnotifications

import android.app.Notification
import android.service.notification.StatusBarNotification

/**
 * Incoming / ongoing call notifications. The pod can only draw a phone icon;
 * the caller name is for the phone UI.
 */
object CallNotificationParser {
    private val CALL_PACKAGES = setOf(
        "com.google.android.dialer",
        "com.android.dialer",
        "com.android.incallui",
        "com.samsung.android.incallui",
        "com.samsung.android.dialer",
        "com.android.server.telecom",
    )

    data class ParsedCall(
        val packageName: String,
        val active: Boolean,
        val callerName: String?,
        val text: String?,
    )

    fun parse(sbn: StatusBarNotification): ParsedCall? {
        val notification = sbn.notification ?: return null
        if (!isCall(sbn.packageName, notification)) return null
        val extras = notification.extras
        val title = extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.trim().orEmpty()
        val text = extras?.getCharSequence(Notification.EXTRA_TEXT)?.toString()?.trim().orEmpty()
        val name = title.ifBlank { null }
        return ParsedCall(
            packageName = sbn.packageName,
            active = true,
            callerName = name,
            text = text.ifBlank { null },
        )
    }

    fun ended(packageName: String): ParsedCall =
        ParsedCall(packageName = packageName, active = false, callerName = null, text = null)

    fun isCall(packageName: String, notification: Notification): Boolean {
        if (notification.category == Notification.CATEGORY_MISSED_CALL) return false
        if (notification.category == Notification.CATEGORY_CALL) return true
        val ongoing = (notification.flags and Notification.FLAG_ONGOING_EVENT) != 0
        return ongoing && CALL_PACKAGES.contains(packageName)
    }
}
