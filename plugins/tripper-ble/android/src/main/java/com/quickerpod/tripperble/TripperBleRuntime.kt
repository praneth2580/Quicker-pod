package com.quickerpod.tripperble

/**
 * Process-wide hooks so the keep-alive notification can disconnect BLE
 * without needing a live Capacitor bridge call.
 */
object TripperBleRuntime {
    @Volatile
    var manager: TripperBleManager? = null

    fun requestDisconnect() {
        try {
            manager?.disconnect()
        } catch (_: Exception) {
            /* best-effort */
        }
    }
}
