package com.quickerpod.tripperble

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat

/**
 * Connects a saved Tripper from the home-screen widget without opening the activity.
 * Uses the same native handshake as an in-app reconnect.
 */
object WidgetPodConnect {
    private var session: SessionListener? = null

    fun start(context: Context, address: String, displayName: String) {
        val app = context.applicationContext
        val name = displayName.ifBlank { "Tripper" }
        val listener = SessionListener(app, name)
        val previous = session
        session = listener

        if (!canUseBle(app)) {
            listener.onPairingFailed("Allow Bluetooth for Quicker Pod, then tap the pod again.")
            return
        }
        if (!BluetoothAdapter.checkBluetoothAddress(address)) {
            listener.onPairingFailed("This pod has no saved Bluetooth address.")
            return
        }

        val existing = TripperBleRuntime.manager
        val manager = if (existing != null) {
            if (previous != null) existing.removeListener(previous)
            existing.addListener(listener)
            existing
        } else {
            TripperBleManager(app, listener).also { TripperBleRuntime.manager = it }
        }

        if (!manager.isBluetoothReady()) {
            listener.onPairingFailed("Bluetooth is off.")
            return
        }

        try {
            manager.reconnect(address, known = true, loadingHex = null, handshake = null)
        } catch (e: SecurityException) {
            listener.onPairingFailed(e.message ?: "Bluetooth permission is missing.")
        } catch (e: Exception) {
            listener.onPairingFailed(e.message ?: "Couldn't connect.")
        }
    }

    private fun canUseBle(context: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true
        val connect = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT)
        val advertise = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_ADVERTISE)
        return connect == PackageManager.PERMISSION_GRANTED &&
            advertise == PackageManager.PERMISSION_GRANTED
    }

    private class SessionListener(
        private val app: Context,
        private val requestedName: String,
    ) : TripperBleManager.Listener {
        private var linked = false

        override fun onLog(message: String, level: String, data: Map<String, Any?>?) = Unit

        override fun onConnected(address: String, name: String) {
            RideKeepAliveService.update(app, name.ifBlank { requestedName }, "Connecting…")
        }

        override fun onReadyForPin(address: String, name: String) {
            RideKeepAliveService.update(
                app,
                name.ifBlank { requestedName },
                "This Tripper needs a PIN. Open Quicker Pod to enter it.",
            )
        }

        override fun onAlreadyPaired(address: String, name: String) {
            linked = true
            RideKeepAliveService.update(
                app,
                name.ifBlank { requestedName },
                "Linked — keeping Bluetooth alive",
            )
        }

        override fun onRx(hex: String, label: String?) = Unit

        override fun onAuth(hex: String, accepted: Boolean) = Unit

        override fun onDisconnected(reason: String?) {
            if (!linked) return
            linked = false
            RideKeepAliveService.stop(app)
        }

        override fun onPairingComplete(address: String, name: String, readyForPin: Boolean) {
            if (readyForPin) return
            linked = true
            RideKeepAliveService.update(
                app,
                name.ifBlank { requestedName },
                "Linked — keeping Bluetooth alive",
            )
        }

        override fun onPairingFailed(message: String) {
            linked = false
            RideKeepAliveService.fail(app, requestedName, message)
        }
    }
}
