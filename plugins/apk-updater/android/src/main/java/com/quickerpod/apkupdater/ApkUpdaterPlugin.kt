package com.quickerpod.apkupdater

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.concurrent.thread

@CapacitorPlugin(name = "ApkUpdater")
class ApkUpdaterPlugin : Plugin() {
    private val cancelFlag = AtomicBoolean(false)
    private var downloadThread: Thread? = null

    @PluginMethod
    fun canInstallPackages(call: PluginCall) {
        val allowed =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.packageManager.canRequestPackageInstalls()
            } else {
                true
            }
        val ret = JSObject()
        ret.put("allowed", allowed)
        call.resolve(ret)
    }

    @PluginMethod
    fun openInstallSettings(call: PluginCall) {
        val activity = activity ?: run {
            call.reject("Activity unavailable")
            return
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:${context.packageName}"),
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                activity.startActivity(intent)
            } else {
                val intent = Intent(Settings.ACTION_SECURITY_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                activity.startActivity(intent)
            }
            call.resolve()
        } catch (e: Exception) {
            call.reject("Could not open install settings: ${e.message}")
        }
    }

    @PluginMethod
    fun cancelDownload(call: PluginCall) {
        cancelFlag.set(true)
        call.resolve()
    }

    @PluginMethod
    fun downloadAndInstall(call: PluginCall) {
        val urlString = call.getString("url")?.trim().orEmpty()
        if (urlString.isEmpty()) {
            call.reject("url is required")
            return
        }
        if (!urlString.startsWith("https://")) {
            call.reject("Only https:// APK URLs are allowed")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            call.reject(
                "Install permission required",
                "INSTALL_PERMISSION",
                null,
            )
            return
        }

        cancelFlag.set(false)
        call.setKeepAlive(true)

        downloadThread = thread(name = "ApkUpdater-download") {
            try {
                val apkFile = downloadApk(urlString) { written, total ->
                    val progress =
                        if (total > 0) (written.toDouble() / total.toDouble()).coerceIn(0.0, 1.0) else 0.0
                    val event = JSObject()
                    event.put("progress", progress)
                    event.put("bytesWritten", written)
                    event.put("totalBytes", total)
                    notifyListeners("downloadProgress", event)
                }

                if (cancelFlag.get()) {
                    apkFile.delete()
                    call.reject("Download cancelled", "CANCELLED", null)
                    return@thread
                }

                bridge.activity.runOnUiThread {
                    try {
                        launchInstaller(apkFile)
                        val ret = JSObject()
                        ret.put("started", true)
                        call.resolve(ret)
                    } catch (e: Exception) {
                        call.reject("Could not open installer: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                if (cancelFlag.get()) {
                    call.reject("Download cancelled", "CANCELLED", null)
                } else {
                    call.reject("Download failed: ${e.message}")
                }
            }
        }
    }

    private fun downloadApk(
        urlString: String,
        onProgress: (written: Long, total: Long) -> Unit,
    ): File {
        val dir = File(context.cacheDir, "updates")
        if (!dir.exists() && !dir.mkdirs()) {
            throw IllegalStateException("Could not create updates cache directory")
        }
        val outFile = File(dir, "quicker-pod-update.apk")
        if (outFile.exists()) {
            outFile.delete()
        }

        var connection: HttpURLConnection? = null
        try {
            connection = (URL(urlString).openConnection() as HttpURLConnection).apply {
                connectTimeout = 30_000
                readTimeout = 60_000
                instanceFollowRedirects = true
                requestMethod = "GET"
                setRequestProperty("Accept", "application/vnd.android.package-archive,*/*")
                setRequestProperty("User-Agent", "QuickerPod-ApkUpdater")
            }

            val code = connection.responseCode
            if (code !in 200..299) {
                throw IllegalStateException("HTTP $code")
            }

            val total = connection.contentLengthLong.coerceAtLeast(0L)
            var written = 0L
            BufferedInputStream(connection.inputStream).use { input ->
                FileOutputStream(outFile).use { output ->
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        if (cancelFlag.get()) {
                            throw InterruptedException("cancelled")
                        }
                        val read = input.read(buffer)
                        if (read < 0) break
                        output.write(buffer, 0, read)
                        written += read
                        onProgress(written, total)
                    }
                    output.flush()
                }
            }

            if (written <= 0L) {
                throw IllegalStateException("Downloaded file is empty")
            }
            onProgress(written, if (total > 0) total else written)
            return outFile
        } finally {
            connection?.disconnect()
        }
    }

    private fun launchInstaller(apkFile: File) {
        val activity = activity ?: throw IllegalStateException("Activity unavailable")
        val authority = "${context.packageName}.fileprovider"
        val uri = FileProvider.getUriForFile(context, authority, apkFile)
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        activity.startActivity(intent)
    }
}
