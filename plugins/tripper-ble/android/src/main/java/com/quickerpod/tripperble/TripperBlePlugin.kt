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
    ],
)
class TripperBlePlugin : Plugin(), TripperBleManager.Listener {
    private var manager: TripperBleManager? = null
    private var pendingPairingCall: PluginCall? = null
    private var pendingPermissionAction: String? = null

    private fun ensureManager(): TripperBleManager {
        val existing = manager
        if (existing != null) return existing
        val created = TripperBleManager(context.applicationContext, this)
        manager = created
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
        call.resolve()
    }

    override fun handleOnDestroy() {
        pendingPairingCall = null
        manager?.release()
        manager = null
        super.handleOnDestroy()
    }

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
        val event = JSObject()
        event.put("address", address)
        event.put("name", name)
        notifyListeners("connected", event)
    }

    override fun onReadyForPin(address: String, name: String) {
        val event = JSObject()
        event.put("address", address)
        event.put("name", name)
        notifyListeners("readyForPin", event)
    }

    override fun onAlreadyPaired(address: String, name: String) {
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
        val event = JSObject()
        if (reason != null) event.put("reason", reason)
        notifyListeners("disconnected", event)
    }

    override fun onPairingComplete(address: String, name: String, readyForPin: Boolean) {
        val call = pendingPairingCall ?: return
        pendingPairingCall = null
        val ret = JSObject()
        ret.put("address", address)
        ret.put("name", name)
        ret.put("readyForPin", readyForPin)
        call.resolve(ret)
    }

    override fun onPairingFailed(message: String) {
        val call = pendingPairingCall
        pendingPairingCall = null
        call?.reject(message)
    }

    // endregion
}
