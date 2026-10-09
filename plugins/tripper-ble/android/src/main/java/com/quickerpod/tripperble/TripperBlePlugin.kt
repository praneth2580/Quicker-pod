package com.quickerpod.tripperble

import android.Manifest
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback

@CapacitorPlugin(
    name = "TripperBle",
    permissions = [
        Permission(
            strings = [
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION,
            ],
            alias = "bleLegacy",
        ),
        Permission(
            strings = [
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_ADVERTISE,
            ],
            alias = "bleModern",
        ),
        Permission(
            strings = [Manifest.permission.POST_NOTIFICATIONS],
            alias = "notifications",
        ),
    ],
)
class TripperBlePlugin : Plugin(), TripperBleManager.Listener {
    private var manager: TripperBleManager? = null
    private var pendingPairingCall: PluginCall? = null
    private var pendingPermissionAction: String? = null
    private var pendingKeepAliveCall: PluginCall? = null

    private fun ensureManager(): TripperBleManager {
        val existing = manager
        if (existing != null) return existing
        val created = TripperBleManager(context.applicationContext, this)
        manager = created
        TripperBleRuntime.manager = created
        return created
    }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val ready = try {
            ensureManager().isBluetoothReady()
        } catch (_: Exception) {
            false
        }
        val ret = JSObject()
        ret.put("available", ready)
        call.resolve(ret)
    }

    @PluginMethod
    fun startPairing(call: PluginCall) {
        if (!ensureBlePermissions(call)) return
        val mgr = ensureManager()
        if (!mgr.isBluetoothReady()) {
            call.reject("Bluetooth is off or unavailable")
            return
        }
        if (pendingPairingCall != null) {
            call.reject("Pairing already in progress")
            return
        }
        pendingPairingCall = call
        call.setKeepAlive(true)

        val address = call.getString("address")
        val known = call.getBoolean("knownDevice", false) ?: false
        val scanTimeout = (call.getInt("scanTimeoutMs") ?: 15_000).toLong()
        val loadingHex = call.getString("loadingScreenHex")
        val handshakeHex = call.getString("handshakeHex")

        mgr.startPairing(address, known, scanTimeout, loadingHex, handshakeHex)
    }

    @PluginMethod
    fun reconnect(call: PluginCall) {
        if (!ensureBlePermissions(call)) return
        val address = call.getString("address")
        if (address.isNullOrBlank()) {
            call.reject("address is required")
            return
        }
        val mgr = ensureManager()
        if (!mgr.isBluetoothReady()) {
            call.reject("Bluetooth is off or unavailable")
            return
        }
        if (pendingPairingCall != null) {
            call.reject("Pairing already in progress")
            return
        }
        pendingPairingCall = call
        call.setKeepAlive(true)

        val known = call.getBoolean("knownDevice", true) ?: true
        val loadingHex = call.getString("loadingScreenHex")
        val handshakeHex = call.getString("handshakeHex")
        mgr.reconnect(address, known, loadingHex, handshakeHex)
    }

    @PluginMethod
    fun submitPin(call: PluginCall) {
        val mgr = manager
        if (mgr == null) {
            call.reject("Not connected — call startPairing/reconnect first")
            return
        }
        try {
            val packetHex = call.getString("packetHex")
            val packet = if (!packetHex.isNullOrBlank()) {
                mgr.hexToBytes(packetHex)
            } else {
                val pin = call.getString("pin")
                if (pin.isNullOrBlank()) {
                    call.reject("pin or packetHex is required")
                    return
                }
                mgr.buildPinPacket(pin)
            }
            if (packet.size != 20) {
                call.reject("PIN packet must be 20 bytes")
                return
            }
            mgr.submitPinPacket(packet)
            val ret = JSObject()
            ret.put("submitted", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject(e.message ?: "submitPin failed", e)
        }
    }

    @PluginMethod
    fun writePacket(call: PluginCall) {
        val mgr = manager
        if (mgr == null) {
            call.reject("Not connected")
            return
        }
        val hex = call.getString("hex")
        if (hex.isNullOrBlank()) {
            call.reject("hex is required")
            return
        }
        try {
            mgr.writePacket(mgr.hexToBytes(hex), "writePacket")
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message ?: "writePacket failed", e)
        }
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        pendingPairingCall?.reject("Disconnected")
        pendingPairingCall = null
        manager?.disconnect()
        stopKeepAliveInternal()
        call.resolve()
    }

    @PluginMethod
    fun startKeepAlive(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (getPermissionState("notifications") != PermissionState.GRANTED) {
                pendingKeepAliveCall = call
                call.setKeepAlive(true)
                requestPermissionForAlias("notifications", call, "notificationPermsCallback")
                return
            }
        }
        beginKeepAlive(call)
    }

    @PluginMethod
    fun updateKeepAlive(call: PluginCall) {
        val deviceName = call.getString("deviceName")
        val text = call.getString("text")
        try {
            RideKeepAliveService.update(context.applicationContext, deviceName, text)
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message ?: "updateKeepAlive failed", e)
        }
    }

    @PluginMethod
    fun stopKeepAlive(call: PluginCall) {
        stopKeepAliveInternal()
        call.resolve()
    }

    override fun handleOnDestroy() {
        pendingPairingCall = null
        pendingKeepAliveCall = null
        stopKeepAliveInternal()
        val mgr = manager
        manager = null
        if (TripperBleRuntime.manager === mgr) {
            TripperBleRuntime.manager = null
        }
        mgr?.release()
        super.handleOnDestroy()
    }

    // region keep-alive

    private fun beginKeepAlive(call: PluginCall) {
        val deviceName = call.getString("deviceName") ?: "Tripper"
        val text = call.getString("text")
            ?: "Linked — keeping Bluetooth alive for navigation"
        try {
            RideKeepAliveService.start(context.applicationContext, deviceName, text)
            val ret = JSObject()
            ret.put("started", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject(e.message ?: "startKeepAlive failed", e)
        }
    }

    private fun startKeepAliveInternal(deviceName: String, text: String) {
        try {
            RideKeepAliveService.start(context.applicationContext, deviceName, text)
        } catch (_: Exception) {
            /* best-effort — JS may retry after notification permission */
        }
    }

    private fun stopKeepAliveInternal() {
        try {
            RideKeepAliveService.stop(context.applicationContext)
        } catch (_: Exception) {
            /* ignore */
        }
    }

    // endregion

    // region permissions

    private fun ensureBlePermissions(call: PluginCall): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (getPermissionState("bleModern") != PermissionState.GRANTED) {
                pendingPermissionAction = call.methodName
                requestPermissionForAlias("bleModern", call, "blePermsCallback")
                return false
            }
        } else {
            if (getPermissionState("bleLegacy") != PermissionState.GRANTED) {
                pendingPermissionAction = call.methodName
                requestPermissionForAlias("bleLegacy", call, "blePermsCallback")
                return false
            }
        }
        return true
    }

    @PermissionCallback
    private fun blePermsCallback(call: PluginCall) {
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getPermissionState("bleModern") == PermissionState.GRANTED
        } else {
            getPermissionState("bleLegacy") == PermissionState.GRANTED
        }
        if (!granted) {
            pendingPermissionAction = null
            call.reject("Bluetooth permissions are required for Tripper pairing")
            return
        }
        when (pendingPermissionAction) {
            "startPairing" -> startPairing(call)
            "reconnect" -> reconnect(call)
            else -> call.resolve()
        }
        pendingPermissionAction = null
    }

    @PermissionCallback
    private fun notificationPermsCallback(call: PluginCall) {
        val pending = pendingKeepAliveCall ?: call
        pendingKeepAliveCall = null
        // Start keep-alive even if the user denied notifications — the FGS still helps.
        beginKeepAlive(pending)
    }

    // endregion

    // region TripperBleManager.Listener

    override fun onLog(message: String, level: String, data: Map<String, Any?>?) {
        val event = JSObject()
        event.put("message", message)
        event.put("level", level)
        if (data != null) {
            val dataObj = JSObject()
            for ((k, v) in data) {
                dataObj.put(k, v)
            }
            event.put("data", dataObj)
        }
        notifyListeners("log", event)
    }

    override fun onConnected(address: String, name: String) {
        startKeepAliveInternal(name, "Connecting — keeping the session alive")
        val event = JSObject()
        event.put("address", address)
        event.put("name", name)
        notifyListeners("connected", event)
    }

    override fun onReadyForPin(address: String, name: String) {
        startKeepAliveInternal(name, "Enter the PIN on your phone — session protected")
        val event = JSObject()
        event.put("address", address)
        event.put("name", name)
        notifyListeners("readyForPin", event)
    }

    override fun onAlreadyPaired(address: String, name: String) {
        startKeepAliveInternal(name, "Linked — keeping Bluetooth alive for navigation")
        val event = JSObject()
        event.put("address", address)
        event.put("name", name)
        notifyListeners("connected", event)
    }

    override fun onRx(hex: String, label: String?) {
        val event = JSObject()
        event.put("hex", hex)
        if (label != null) event.put("label", label)
        notifyListeners("rx", event)
    }

    override fun onAuth(hex: String, accepted: Boolean) {
        val event = JSObject()
        event.put("hex", hex)
        event.put("accepted", accepted)
        notifyListeners("auth", event)
    }

    override fun onDisconnected(reason: String?) {
        stopKeepAliveInternal()
        val event = JSObject()
        if (reason != null) event.put("reason", reason)
        notifyListeners("disconnected", event)
    }

    override fun onPairingComplete(address: String, name: String, readyForPin: Boolean) {
        if (!readyForPin) {
            startKeepAliveInternal(name, "Linked — keeping Bluetooth alive for navigation")
        }
        val call = pendingPairingCall ?: return
        pendingPairingCall = null
        val ret = JSObject()
        ret.put("address", address)
        ret.put("name", name)
        ret.put("readyForPin", readyForPin)
        call.resolve(ret)
    }

    override fun onPairingFailed(message: String) {
        stopKeepAliveInternal()
        val call = pendingPairingCall
        pendingPairingCall = null
        call?.reject(message)
    }

    // endregion
}
