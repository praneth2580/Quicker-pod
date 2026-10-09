package com.quickerpod.navnotifications

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.text.TextUtils
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject

@CapacitorPlugin(name = "NavNotifications")
class NavNotificationsPlugin : Plugin(), MapsNavBridge.Listener {
    override fun load() {
        MapsNavBridge.addListener(this)
    }

    override fun handleOnDestroy() {
        MapsNavBridge.removeListener(this)
        super.handleOnDestroy()
    }

    /**
     * Re-check grant state whenever the activity resumes (e.g. user returns from
     * Notification access settings). Does not assume grant — always verifies.
     */
    override fun handleOnResume() {
        super.handleOnResume()
        maybeRequestRebind()
        notifyListeners("statusChange", statusObject())
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        call.resolve(statusObject())
    }

    /** Alias for [getStatus] → enabled field; matches common plugin naming. */
    @PluginMethod
    fun isEnabled(call: PluginCall) {
        val ret = JSObject()
        ret.put("enabled", isNotificationListenerEnabled())
        ret.put("listenerAvailable", isListenerBundled())
        call.resolve(ret)
    }

    @PluginMethod
    fun openNotificationAccessSettings(call: PluginCall) {
        openSettingsInternal(call)
    }

    /** Alias for [openNotificationAccessSettings]. */
    @PluginMethod
    fun openSettings(call: PluginCall) {
        openSettingsInternal(call)
    }

    /**
     * Open this app's system App info screen so the user can enable
     * "Allow restricted settings" (Android 13+ sideload) before Notification access.
     */
    @PluginMethod
    fun openAppInfo(call: PluginCall) {
        try {
            context.startActivity(buildAppInfoIntent())
            call.resolve()
        } catch (e: Exception) {
            call.reject("Unable to open app info: ${e.message}")
        }
    }

    @PluginMethod
    fun requestCurrent(call: PluginCall) {
        val found = MapsNotificationListener.requestCurrentFromService()
        val ret = JSObject()
        ret.put("found", found)
        call.resolve(ret)
        notifyListeners("statusChange", statusObject())
    }

    override fun onNavUpdate(parsed: MapsNavParser.ParsedNav) {
        val obj = JSObject()
        obj.put("packageName", parsed.packageName)
        obj.put("title", parsed.title)
        obj.put("text", parsed.text)
        if (parsed.turnText != null) obj.put("turnText", parsed.turnText) else obj.put("turnText", JSONObject.NULL)
        if (parsed.distanceM != null) obj.put("distanceM", parsed.distanceM) else obj.put("distanceM", JSONObject.NULL)
        if (parsed.etaSeconds != null) obj.put("etaSeconds", parsed.etaSeconds) else obj.put("etaSeconds", JSONObject.NULL)
        if (parsed.maneuverName != null) obj.put("maneuverName", parsed.maneuverName) else obj.put("maneuverName", JSONObject.NULL)
        if (parsed.streetName != null) obj.put("streetName", parsed.streetName) else obj.put("streetName", JSONObject.NULL)
        obj.put("rerouting", parsed.rerouting)
        obj.put("stopped", parsed.stopped)
        obj.put("timestamp", System.currentTimeMillis())
        notifyListeners("navUpdate", obj)
    }

    override fun onCallUpdate(parsed: CallNotificationParser.ParsedCall) {
        val obj = JSObject()
        obj.put("packageName", parsed.packageName)
        obj.put("active", parsed.active)
        if (parsed.callerName != null) obj.put("callerName", parsed.callerName) else obj.put("callerName", JSONObject.NULL)
        if (parsed.text != null) obj.put("text", parsed.text) else obj.put("text", JSONObject.NULL)
        obj.put("timestamp", System.currentTimeMillis())
        notifyListeners("callUpdate", obj)
    }

    override fun onListenerConnected(connected: Boolean) {
        notifyListeners("statusChange", statusObject())
    }

    private fun openSettingsInternal(call: PluginCall) {
        try {
            context.startActivity(buildNotificationAccessIntent())
            call.resolve()
        } catch (e: Exception) {
            call.reject("Unable to open notification access settings: ${e.message}")
        }
    }

    /**
     * Prefer the system Notification Listener settings screen.
     * On API 30+, try the per-component detail page first (still user-toggled).
     * Fall back to app details / general Settings if the primary Intent is unavailable.
     */
    private fun buildNotificationAccessIntent(): Intent {
        val cn = listenerComponentName()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                val detail = Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS).apply {
                    putExtra(
                        Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME,
                        cn.flattenToString(),
                    )
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                if (detail.resolveActivity(context.packageManager) != null) {
                    return detail
                }
            } catch (_: Exception) {
                // Fall through to the list screen.
            }
        }

        val list = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (list.resolveActivity(context.packageManager) != null) {
            return list
        }

        // Safe fallback: app info (user can reach Special app access from there on most OEMs).
        return buildAppInfoIntent()
    }

    private fun buildAppInfoIntent(): Intent =
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", context.packageName, null)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

    private fun statusObject(): JSObject {
        val bundled = isListenerBundled()
        val enabled = bundled && isNotificationListenerEnabled()
        val obj = JSObject()
        obj.put("supported", true)
        obj.put("listenerAvailable", bundled)
        obj.put("enabled", enabled)
        obj.put("connected", enabled && MapsNavBridge.serviceConnected)
        return obj
    }

    private fun isListenerBundled(): Boolean {
        return try {
            val flags =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    PackageManager.MATCH_DISABLED_COMPONENTS
                } else {
                    0
                }
            context.packageManager.getServiceInfo(listenerComponentName(), flags)
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    /**
     * True when this app's NotificationListenerService component (or package) appears in
     * Settings.Secure.ENABLED_NOTIFICATION_LISTENERS.
     */
    private fun isNotificationListenerEnabled(): Boolean {
        val cn = listenerComponentName()
        // Constant string for Settings.Secure.ENABLED_NOTIFICATION_LISTENERS
        // (public API field is not always visible to library compileSdk).
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners",
        ) ?: return false
        if (TextUtils.isEmpty(flat)) return false
        for (name in flat.split(":")) {
            val parsed = ComponentName.unflattenFromString(name) ?: continue
            if (parsed == cn) return true
            // Some OEMs store a package-level grant.
            if (parsed.packageName == context.packageName) return true
        }
        return flat.contains(context.packageName)
    }

    /**
     * When access is granted but the service has not connected yet (common after toggling
     * in Settings), ask the system to rebind. Legitimate API — not a permission bypass.
     */
    private fun maybeRequestRebind() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return
        if (!isNotificationListenerEnabled()) return
        if (MapsNavBridge.serviceConnected) return
        try {
            NotificationListenerService.requestRebind(listenerComponentName())
        } catch (_: Exception) {
            // Best-effort; system may ignore if not yet eligible.
        }
    }

    private fun listenerComponentName(): ComponentName =
        ComponentName(context, MapsNotificationListener::class.java)
}
