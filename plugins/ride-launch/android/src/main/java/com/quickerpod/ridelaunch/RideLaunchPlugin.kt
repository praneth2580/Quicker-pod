package com.quickerpod.ridelaunch

import android.app.Activity
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.IOException
import java.nio.charset.Charset

@CapacitorPlugin(name = "RideLaunch")
class RideLaunchPlugin : Plugin() {
    companion object {
        const val RIDE_URI = "quickerpod://ride"
    }

    private var pendingWrite: PluginCall? = null
    private var readerCallback: NfcAdapter.ReaderCallback? = null

    @PluginMethod
    fun getNfcStatus(call: PluginCall) {
        val adapter = NfcAdapter.getDefaultAdapter(context)
        val ret = JSObject()
        ret.put("supported", adapter != null)
        ret.put("enabled", adapter?.isEnabled == true)
        call.resolve(ret)
    }

    @PluginMethod
    fun writeRideNfcTag(call: PluginCall) {
        val activity = activity ?: run {
            call.reject("Activity unavailable")
            return
        }
        val adapter = NfcAdapter.getDefaultAdapter(context)
        if (adapter == null) {
            call.reject("This device does not support NFC")
            return
        }
        if (!adapter.isEnabled) {
            call.reject("NFC is turned off. Enable it in system settings.")
            return
        }

        cancelReaderMode(activity)
        pendingWrite?.reject("Cancelled — new write started")
        pendingWrite = call
        call.setKeepAlive(true)

        val callback = NfcAdapter.ReaderCallback { tag ->
            val writeCall = pendingWrite ?: return@ReaderCallback
            try {
                writeUriToTag(tag, RIDE_URI)
                val ret = JSObject()
                ret.put("written", true)
                ret.put("uri", RIDE_URI)
                writeCall.resolve(ret)
            } catch (e: Exception) {
                writeCall.reject("NFC write failed: ${e.message}")
            } finally {
                pendingWrite = null
                cancelReaderMode(activity)
            }
        }
        readerCallback = callback

        val flags =
            NfcAdapter.FLAG_READER_NFC_A or
                NfcAdapter.FLAG_READER_NFC_B or
                NfcAdapter.FLAG_READER_NFC_F or
                NfcAdapter.FLAG_READER_NFC_V or
                NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK

        activity.runOnUiThread {
            adapter.enableReaderMode(activity, callback, flags, null)
        }
    }

    @PluginMethod
    fun cancelNfcWrite(call: PluginCall) {
        pendingWrite?.reject("NFC write cancelled")
        pendingWrite = null
        activity?.let { cancelReaderMode(it) }
        call.resolve()
    }

    override fun handleOnPause() {
        // Keep reader mode across brief pauses; cancel only on destroy / explicit cancel.
        super.handleOnPause()
    }

    override fun handleOnDestroy() {
        pendingWrite?.reject("Activity destroyed")
        pendingWrite = null
        activity?.let { cancelReaderMode(it) }
        super.handleOnDestroy()
    }

    private fun cancelReaderMode(activity: Activity) {
        val adapter = NfcAdapter.getDefaultAdapter(context) ?: return
        try {
            adapter.disableReaderMode(activity)
        } catch (_: Exception) {
            /* ignore */
        }
        readerCallback = null
    }

    private fun writeUriToTag(tag: Tag, uri: String) {
        val message = NdefMessage(arrayOf(createUriRecord(uri)))
        val ndef = Ndef.get(tag)
        if (ndef != null) {
            ndef.connect()
            try {
                if (!ndef.isWritable) {
                    throw IOException("Tag is not writable")
                }
                val size = message.toByteArray().size
                if (ndef.maxSize < size) {
                    throw IOException("Tag capacity too small ($size > ${ndef.maxSize})")
                }
                ndef.writeNdefMessage(message)
            } finally {
                try {
                    ndef.close()
                } catch (_: Exception) {
                }
            }
            return
        }

        val formatable = NdefFormatable.get(tag)
            ?: throw IOException("Tag does not support NDEF")
        formatable.connect()
        try {
            formatable.format(message)
        } finally {
            try {
                formatable.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun createUriRecord(uri: String): NdefRecord {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
            return NdefRecord.createUri(uri)
        }
        val uriBytes = uri.toByteArray(Charset.forName("UTF-8"))
        val payload = ByteArray(uriBytes.size + 1)
        payload[0] = 0x00 // no abbreviation
        System.arraycopy(uriBytes, 0, payload, 1, uriBytes.size)
        return NdefRecord(NdefRecord.TNF_WELL_KNOWN, NdefRecord.RTD_URI, ByteArray(0), payload)
    }
}
