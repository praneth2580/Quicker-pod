package com.quickerpod.navnotifications

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * Reads Google Maps (and optionally Waze) navigation notifications and forwards
 * parsed turn / distance updates to the Capacitor plugin via [MapsNavBridge].
 */
class MapsNotificationListener : NotificationListenerService() {
    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "Notification listener connected")
        MapsNavBridge.setServiceConnected(true)
        emitActiveMapsNotifications()
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.i(TAG, "Notification listener disconnected")
        MapsNavBridge.setServiceConnected(false)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val call = CallNotificationParser.parse(sbn)
        if (call != null) {
            Log.d(TAG, "Call: ${call.callerName ?: "unknown"}")
            MapsNavBridge.emitCall(call)
            return
        }
        if (!MapsNavParser.isNavigationPackage(sbn.packageName)) return
        val parsed = MapsNavParser.parse(sbn) ?: return
        Log.d(TAG, "Maps nav: ${parsed.maneuverName} ${parsed.distanceM}m — ${parsed.turnText}")
        MapsNavBridge.emit(parsed)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val notification = sbn.notification
        if (notification != null && CallNotificationParser.isCall(sbn.packageName, notification)) {
            val stillCalling = try {
                activeNotifications?.any {
                    it.key != sbn.key &&
                        it.notification != null &&
                        CallNotificationParser.isCall(it.packageName, it.notification)
                } == true
            } catch (_: SecurityException) {
                false
            }
            if (!stillCalling) {
                MapsNavBridge.emitCall(CallNotificationParser.ended(sbn.packageName))
            }
            return
        }
        if (!MapsNavParser.isNavigationPackage(sbn.packageName)) return
        // Only stop if no other Maps nav notification remains.
        val stillActive = try {
            activeNotifications?.any {
                it.key != sbn.key && MapsNavParser.isNavigationPackage(it.packageName) &&
                    MapsNavParser.parse(it) != null
            } == true
        } catch (_: SecurityException) {
            false
        }
        if (!stillActive) {
            MapsNavBridge.emit(MapsNavParser.stoppedEvent(sbn.packageName))
        }
    }

    private fun emitActiveMapsNotifications() {
        try {
            val notifications = activeNotifications ?: return
            for (sbn in notifications) {
                val call = CallNotificationParser.parse(sbn)
                if (call != null) MapsNavBridge.emitCall(call)
                if (!MapsNavParser.isNavigationPackage(sbn.packageName)) continue
                val parsed = MapsNavParser.parse(sbn) ?: continue
                MapsNavBridge.emit(parsed)
            }
        } catch (e: SecurityException) {
            Log.w(TAG, "Cannot read active notifications: ${e.message}")
        }
    }

    companion object {
        private const val TAG = "QuickerMapsNav"

        /** Best-effort pull of currently posted Maps nav (called from plugin). */
        fun requestCurrentFromService(): Boolean {
            // Service instance is managed by the system; bridge consumers get
            // updates via onListenerConnected / onNotificationPosted.
            return MapsNavBridge.serviceConnected
        }
    }
}
