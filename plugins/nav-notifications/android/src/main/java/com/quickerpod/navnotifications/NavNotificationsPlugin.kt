package com.quickerpod.navnotifications

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
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

    @PluginMethod
    fun getStatus(call: PluginCall) {
        call.resolve(statusObject())
    }

    @PluginMethod
    fun openNotificationAccessSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Unable to open notification access settings: ${e.message}")
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
        obj.put("rerouting", parsed.rerouting)
        obj.put("stopped", parsed.stopped)
        obj.put("timestamp", System.currentTimeMillis())
        notifyListeners("navUpdate", obj)
    }

    override fun onListenerConnected(connected: Boolean) {
        notifyListeners("statusChange", statusObject())
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
            context.packageManager.getServiceInfo(
                ComponentName(context, MapsNotificationListener::class.java),
                flags,
            )
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    private fun isNotificationListenerEnabled(): Boolean {
        val cn = ComponentName(context, MapsNotificationListener::class.java)
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners",
        ) ?: return false
        if (TextUtils.isEmpty(flat)) return false
        for (name in flat.split(":")) {
            val parsed = ComponentName.unflattenFromString(name) ?: continue
            if (parsed == cn) return true
            // Package-level grant (some OEMs store package only)
            if (parsed.packageName == context.packageName) return true
        }
        return false
    }
}
