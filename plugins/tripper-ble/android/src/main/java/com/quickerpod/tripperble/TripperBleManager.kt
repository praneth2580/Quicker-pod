package com.quickerpod.tripperble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattServer
import android.bluetooth.BluetoothGattServerCallback
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import java.util.UUID
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Dual-role Tripper BLE manager (phone = GATT client + GATT server).
 * Sequence matches tripper-sdk/docs/startup-handshake.md / official RE app.
 */
@SuppressLint("MissingPermission")
class TripperBleManager(
    private val context: Context,
    private val listener: Listener,
) {
    interface Listener {
        fun onLog(message: String, level: String = "info", data: Map<String, Any?>? = null)
        fun onConnected(address: String, name: String)
        fun onReadyForPin(address: String, name: String)
        fun onAlreadyPaired(address: String, name: String)
        fun onRx(hex: String, label: String?)
        fun onAuth(hex: String, accepted: Boolean)
        fun onDisconnected(reason: String?)
        fun onPairingComplete(address: String, name: String, readyForPin: Boolean)
        fun onPairingFailed(message: String)
    }

    companion object {
        val SERVICE_UUID: UUID = UUID.fromString("01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0")
        val CHAR_UUID: UUID = UUID.fromString("01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0")
        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

        private const val WRITE_SPACING_MS = 80L
        private const val WRITE_TIMEOUT_MS = 80L
        private const val PRE_CONNECT_SERVER_MS = 200L
        private const val PRE_HANDSHAKE_MS = 200L
        private const val SHOW_PIN_UI_MS = 300L

        /** Default loading screen (`buildLoadingScreen()`): 10 11 1C … CRC. */
        val DEFAULT_LOADING_HEX = "10111c0000000000000000000000000000000bea"
        /** SHOW PIN 21 01 … 50 A7 */
        val DEFAULT_SHOW_PIN_HEX = "21010000000000000000000000000000000050a7"
        /** CLOSE / RESUME 21 00 … 40 45 */
        val DEFAULT_CLOSE_HEX = "2100000000000000000000000000000000004045"
        val DEFAULT_PING_FW_HEX = "03000000000000000000000000000000000045d9"
        val DEFAULT_PING_WP_HEX = "300000000000000000000000000000000000428b"

        private val NAME_PREFIXES = listOf("RE_", "RE_DISP")
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private val bluetoothManager =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val adapter: BluetoothAdapter? = bluetoothManager.adapter

    private var gattServer: BluetoothGattServer? = null
    private var gattClient: BluetoothGatt? = null
    private var writeCharacteristic: BluetoothGattCharacteristic? = null

    private var currentDevice: BluetoothDevice? = null
    private var currentName: String = "Unknown"
    private var knownDevice: Boolean = false
    private var loadingScreenHex: String = DEFAULT_LOADING_HEX
    private var handshakeHex: String? = null

    private var pairingCallbackPending = false
    private var scanTimeoutRunnable: Runnable? = null
    private var scanning = false

    private val writeQueue = ConcurrentLinkedQueue<ByteArray>()
    private var writeInFlight = false
    private var lastWriteAt = 0L
    private var writeTimeoutRunnable: Runnable? = null

    private val foundDevices = LinkedHashMap<String, Pair<BluetoothDevice, Int>>()

    fun isBluetoothReady(): Boolean {
        val a = adapter ?: return false
        return a.isEnabled
    }

    fun startPairing(
        address: String?,
        known: Boolean,
        scanTimeoutMs: Long,
        loadingHex: String?,
        handshake: String?,
    ) {
        knownDevice = known
        loadingScreenHex = loadingHex?.takeIf { it.isNotBlank() } ?: DEFAULT_LOADING_HEX
        handshakeHex = handshake?.takeIf { it.isNotBlank() }
        pairingCallbackPending = true
        foundDevices.clear()

        cleanupClient()
        ensureGattServer()

        mainHandler.postDelayed({
            if (!address.isNullOrBlank()) {
                connectToAddress(address)
            } else {
                startScan(scanTimeoutMs)
            }
        }, PRE_CONNECT_SERVER_MS)
    }

    fun reconnect(
        address: String,
        known: Boolean,
        loadingHex: String?,
        handshake: String?,
    ) {
        startPairing(address, known, 0, loadingHex, handshake)
    }

    fun submitPinPacket(packet: ByteArray) {
        enqueueWrite(packet, "PIN")
    }

    fun writePacket(packet: ByteArray, label: String = "packet") {
        enqueueWrite(packet, label)
    }

    fun disconnect() {
        pairingCallbackPending = false
        stopScan()
        cleanupClient()
        stopGattServer()
        listener.onDisconnected("user")
    }

    fun release() {
        pairingCallbackPending = false
        stopScan()
        cleanupClient()
        stopGattServer()
        mainHandler.removeCallbacksAndMessages(null)
    }

    // region GATT server

    private fun ensureGattServer() {
        if (gattServer != null) return
        log("startGattServer()")
        gattServer = bluetoothManager.openGattServer(context, serverCallback)
        val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        val props =
            BluetoothGattCharacteristic.PROPERTY_WRITE or
                BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE
        val perms =
            BluetoothGattCharacteristic.PERMISSION_WRITE or
                BluetoothGattCharacteristic.PERMISSION_WRITE_ENCRYPTED
        val characteristic = BluetoothGattCharacteristic(CHAR_UUID, props, perms)
        service.addCharacteristic(characteristic)
        val added = gattServer?.addService(service) == true
        log("GATT server addService($SERVICE_UUID) → $added")
    }

    private fun stopGattServer() {
        try {
            gattServer?.clearServices()
            gattServer?.close()
        } catch (e: Exception) {
            log("stopGattServer error: ${e.message}", "warn")
        }
        gattServer = null
    }

    private val serverCallback = object : BluetoothGattServerCallback() {
        override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
            log(
                "GATT server connection state",
                data = mapOf(
                    "address" to device.address,
                    "status" to status,
                    "newState" to newState,
                ),
            )
        }

        override fun onCharacteristicWriteRequest(
            device: BluetoothDevice,
            requestId: Int,
            characteristic: BluetoothGattCharacteristic,
            preparedWrite: Boolean,
            responseNeeded: Boolean,
            offset: Int,
            value: ByteArray?,
        ) {
            val bytes = value ?: ByteArray(0)
            val hex = bytesToHex(bytes)
            val label = labelForRx(bytes)
            log("RX via GATT server onCharacteristicWriteRequest", "rx", mapOf("hex" to hex, "label" to label))
            listener.onRx(hex, label)

            if (bytes.isNotEmpty() && (bytes[0].toInt() and 0xff) == 0x20) {
                val accepted = bytes.size > 1 && (bytes[1].toInt() and 0xff) == 0x01
                listener.onAuth(hex, accepted)
            }

            if (responseNeeded) {
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
            }
        }
    }

    // endregion

    // region Scan / connect

    private fun startScan(timeoutMs: Long) {
        val scanner = adapter?.bluetoothLeScanner
        if (scanner == null) {
            failPairing("Bluetooth LE scanner unavailable")
            return
        }
        scanning = true
        log("Scanning for RE_ / RE_DISP…", data = mapOf("timeoutMs" to timeoutMs))

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        // Empty filters + name check in callback — name prefixes are more reliable than UUID filters.
        scanner.startScan(emptyList(), settings, scanCallback)

        val timeout = if (timeoutMs > 0) timeoutMs else 15_000L
        scanTimeoutRunnable = Runnable {
            stopScan()
            pickAndConnect()
        }
        mainHandler.postDelayed(scanTimeoutRunnable!!, timeout)
    }

    private fun stopScan() {
        if (!scanning) return
        scanning = false
        scanTimeoutRunnable?.let { mainHandler.removeCallbacks(it) }
        scanTimeoutRunnable = null
        try {
            adapter?.bluetoothLeScanner?.stopScan(scanCallback)
        } catch (e: Exception) {
            log("stopScan: ${e.message}", "warn")
        }
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device ?: return
            val name = result.scanRecord?.deviceName ?: device.name ?: return
            if (!NAME_PREFIXES.any { name.startsWith(it) }) return
            val rssi = result.rssi
            val prev = foundDevices[device.address]
            if (prev == null || rssi > prev.second) {
                foundDevices[device.address] = device to rssi
                log("Scan hit", data = mapOf("name" to name, "address" to device.address, "rssi" to rssi))
            }
            // Fast path: connect as soon as we see a strong match
            if (foundDevices.size == 1 && rssi > -70) {
                stopScan()
                pickAndConnect()
            }
        }

        override fun onScanFailed(errorCode: Int) {
            failPairing("BLE scan failed: $errorCode")
        }
    }

    private fun pickAndConnect() {
        val best = foundDevices.values.maxByOrNull { it.second }
        if (best == null) {
            failPairing("No Tripper device found (name prefix RE_ / RE_DISP). Turn ignition on and retry.")
            return
        }
        connectDevice(best.first)
    }

    private fun connectToAddress(address: String) {
        val device = try {
            adapter?.getRemoteDevice(address)
        } catch (e: Exception) {
            null
        }
        if (device == null) {
            failPairing("Invalid Bluetooth address: $address")
            return
        }
        connectDevice(device)
    }

    private fun connectDevice(device: BluetoothDevice) {
        currentDevice = device
        currentName = device.name ?: foundDevices[device.address]?.first?.name ?: "Tripper"
        log("connectGatt TRANSPORT_LE", data = mapOf("address" to device.address, "name" to currentName))

        gattClient = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
        } else {
            @Suppress("DEPRECATION")
            device.connectGatt(context, false, gattCallback)
        }
    }

    // endregion

    // region GATT client

    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                log("GATT client CONNECTED", data = mapOf("status" to status))
                val address = gatt.device.address
                val name = currentName
                mainHandler.post {
                    listener.onConnected(address, name)
                    // Official app: send loading screen then discoverServices
                    enqueueWrite(hexToBytes(loadingScreenHex), "LOADING")
                    mainHandler.postDelayed({
                        gatt.discoverServices()
                    }, 50)
                }
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                log("GATT client DISCONNECTED", data = mapOf("status" to status))
                writeCharacteristic = null
                writeQueue.clear()
                writeInFlight = false
                mainHandler.post {
                    listener.onDisconnected("gatt_status_$status")
                    if (pairingCallbackPending) {
                        pairingCallbackPending = false
                        listener.onPairingFailed("Disconnected during pairing (status=$status)")
                    }
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            log("onServicesDiscovered", data = mapOf("status" to status))
            if (status != BluetoothGatt.GATT_SUCCESS) {
                failPairing("Service discovery failed: $status")
                return
            }
            val service = gatt.getService(SERVICE_UUID)
            val char = service?.getCharacteristic(CHAR_UUID)
            if (char == null) {
                failPairing("Tripper characteristic $CHAR_UUID not found")
                return
            }
            writeCharacteristic = char
            char.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE

            val notified = gatt.setCharacteristicNotification(char, true)
            log("setCharacteristicNotification → $notified")
            val cccd = char.getDescriptor(CCCD_UUID)
            if (cccd != null) {
                @Suppress("DEPRECATION")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    gatt.writeDescriptor(cccd, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
                } else {
                    cccd.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                    @Suppress("DEPRECATION")
                    gatt.writeDescriptor(cccd)
                }
                log("CCCD ENABLE_NOTIFICATION written")
            } else {
                log("CCCD absent — continue (Tripper often props=0x04 only)")
            }

            mainHandler.postDelayed({ startHandshake() }, PRE_HANDSHAKE_MS)
        }

        override fun onCharacteristicWrite(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            status: Int,
        ) {
            clearWriteTimeout()
            writeInFlight = false
            pumpQueue()
        }

        @Deprecated("Deprecated in Java")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
        ) {
            @Suppress("DEPRECATION")
            val value = characteristic.value ?: return
            val hex = bytesToHex(value)
            val label = labelForRx(value)
            log("RX via client notify (unexpected path)", "rx", mapOf("hex" to hex))
            mainHandler.post { listener.onRx(hex, label) }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray,
        ) {
            val hex = bytesToHex(value)
            val label = labelForRx(value)
            log("RX via client notify", "rx", mapOf("hex" to hex))
            mainHandler.post { listener.onRx(hex, label) }
        }
    }

    private fun startHandshake() {
        val showPin = !knownDevice
        val hex = handshakeHex
            ?: if (showPin) DEFAULT_SHOW_PIN_HEX else DEFAULT_CLOSE_HEX
        val label = if (showPin) "SHOW PIN" else "CLOSE/RESUME"
        log("startHandshake knownDevice=$knownDevice → $label")
        enqueueWrite(hexToBytes(hex), label)

        val address = currentDevice?.address ?: return
        val name = currentName

        if (showPin) {
            mainHandler.postDelayed({
                listener.onReadyForPin(address, name)
                if (pairingCallbackPending) {
                    pairingCallbackPending = false
                    listener.onPairingComplete(address, name, readyForPin = true)
                }
            }, SHOW_PIN_UI_MS)
        } else {
            // Known device: CLOSE → SET TIME → PING ×2
            mainHandler.postDelayed({
                enqueueWrite(buildSetTimeNowPacket(), "SET TIME")
                mainHandler.postDelayed({
                    enqueueWrite(hexToBytes(DEFAULT_PING_FW_HEX), "PING FW")
                    enqueueWrite(hexToBytes(DEFAULT_PING_FW_HEX), "PING FW")
                    mainHandler.postDelayed({
                        listener.onAlreadyPaired(address, name)
                        if (pairingCallbackPending) {
                            pairingCallbackPending = false
                            listener.onPairingComplete(address, name, readyForPin = false)
                        }
                    }, 300)
                }, 150)
            }, 200)
        }
    }

    // endregion

    // region Write queue

    private fun enqueueWrite(packet: ByteArray, label: String) {
        log("TX enqueue $label", "tx", mapOf("hex" to bytesToHex(packet)))
        writeQueue.offer(packet)
        pumpQueue()
    }

    private fun pumpQueue() {
        if (writeInFlight) return
        val gatt = gattClient ?: return
        val char = writeCharacteristic ?: return
        val packet = writeQueue.poll() ?: return

        val elapsed = System.currentTimeMillis() - lastWriteAt
        val wait = if (lastWriteAt > 0 && elapsed < WRITE_SPACING_MS) {
            WRITE_SPACING_MS - elapsed
        } else {
            0L
        }

        mainHandler.postDelayed({
            writeInFlight = true
            lastWriteAt = System.currentTimeMillis()
            char.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
            val ok = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                gatt.writeCharacteristic(
                    char,
                    packet,
                    BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE,
                ) == android.bluetooth.BluetoothStatusCodes.SUCCESS
            } else {
                @Suppress("DEPRECATION")
                run {
                    char.value = packet
                    gatt.writeCharacteristic(char)
                }
            }
            log("TX write", "tx", mapOf("ok" to ok, "hex" to bytesToHex(packet)))
            // WRITE_TYPE_NO_RESPONSE may never fire onCharacteristicWrite — timeout pumps queue
            writeTimeoutRunnable = Runnable {
                writeInFlight = false
                pumpQueue()
            }
            mainHandler.postDelayed(writeTimeoutRunnable!!, WRITE_TIMEOUT_MS)
        }, wait)
    }

    private fun clearWriteTimeout() {
        writeTimeoutRunnable?.let { mainHandler.removeCallbacks(it) }
        writeTimeoutRunnable = null
    }

    // endregion

    private fun cleanupClient() {
        clearWriteTimeout()
        writeQueue.clear()
        writeInFlight = false
        writeCharacteristic = null
        try {
            gattClient?.disconnect()
            gattClient?.close()
        } catch (_: Exception) {
        }
        gattClient = null
    }

    private fun failPairing(message: String) {
        log(message, "error")
        stopScan()
        if (pairingCallbackPending) {
            pairingCallbackPending = false
            mainHandler.post { listener.onPairingFailed(message) }
        }
    }

    private fun log(message: String, level: String = "info", data: Map<String, Any?>? = null) {
        mainHandler.post { listener.onLog(message, level, data) }
    }

    // region helpers

    private fun labelForRx(bytes: ByteArray): String? {
        if (bytes.isEmpty()) return null
        return when (bytes[0].toInt() and 0xff) {
            0x02 -> "NACK"
            0x03 -> "OS_VERSION"
            0x10 -> "NAV_ACK"
            0x20 -> "AUTH"
            0x21 -> "SESSION"
            0x30 -> "SERIAL"
            0x50 -> "TIME_ACK"
            else -> null
        }
    }

    /** CRC16-CCITT (poly 0x1021, init 0xFFFF) matching TripperProtocol / src/bluetooth/tripper/crc.ts */
    fun crc16(data: ByteArray): Int {
        var crc = 0xffff
        for (raw in data) {
            val b = raw.toInt() and 0xff
            crc = crc xor (b shl 8)
            repeat(8) {
                crc = if (crc and 0x8000 != 0) {
                    ((crc shl 1) xor 0x1021) and 0xffff
                } else {
                    (crc shl 1) and 0xffff
                }
            }
        }
        return crc
    }

    fun buildPinPacket(pin: String): ByteArray {
        val digits = pin.filter { it.isDigit() }.take(6)
        require(digits.length == 6) { "PIN must be exactly 6 digits" }
        val payload = ByteArray(18)
        payload[0] = 0x20
        for (i in digits.indices) {
            payload[1 + i] = digits[i].code.toByte()
        }
        return appendCrc(payload)
    }

    fun buildSetTimeNowPacket(): ByteArray {
        val cal = java.util.Calendar.getInstance()
        val payload = ByteArray(18)
        payload[0] = 0x50
        payload[1] = cal.get(java.util.Calendar.HOUR_OF_DAY).toByte()
        payload[2] = cal.get(java.util.Calendar.MINUTE).toByte()
        payload[3] = 0 // 24h
        return appendCrc(payload)
    }

    private fun appendCrc(payload18: ByteArray): ByteArray {
        val packet = ByteArray(20)
        System.arraycopy(payload18, 0, packet, 0, minOf(18, payload18.size))
        val sum = crc16(packet.copyOfRange(0, 18))
        packet[18] = ((sum shr 8) and 0xff).toByte()
        packet[19] = (sum and 0xff).toByte()
        return packet
    }

    fun bytesToHex(bytes: ByteArray): String =
        bytes.joinToString("") { "%02x".format(it) }

    fun hexToBytes(hex: String): ByteArray {
        val cleaned = hex.replace(Regex("[^0-9a-fA-F]"), "")
        require(cleaned.length % 2 == 0) { "Invalid hex length" }
        return ByteArray(cleaned.length / 2) { i ->
            cleaned.substring(i * 2, i * 2 + 2).toInt(16).toByte()
        }
    }

    // endregion
}
