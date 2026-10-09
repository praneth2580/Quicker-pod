package com.quickerpod.tripperble

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Ongoing foreground notification while Tripper BLE is linked.
 * Keeps the process eligible to stay alive for GATT + nav keepalive.
 */
class RideKeepAliveService : Service() {
    companion object {
        const val CHANNEL_ID = "quicker_pod_ride"
        const val NOTIFICATION_ID = 7101

        const val ACTION_START = "com.quickerpod.tripperble.KEEPALIVE_START"
        const val ACTION_STOP = "com.quickerpod.tripperble.KEEPALIVE_STOP"
        const val ACTION_UPDATE = "com.quickerpod.tripperble.KEEPALIVE_UPDATE"
        const val ACTION_DISCONNECT = "com.quickerpod.tripperble.KEEPALIVE_DISCONNECT"

        const val EXTRA_DEVICE_NAME = "deviceName"
        const val EXTRA_TEXT = "text"

        fun start(context: Context, deviceName: String?, text: String? = null) {
            val intent = Intent(context, RideKeepAliveService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_DEVICE_NAME, deviceName)
                putExtra(EXTRA_TEXT, text)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun update(context: Context, deviceName: String?, text: String? = null) {
            val intent = Intent(context, RideKeepAliveService::class.java).apply {
                action = ACTION_UPDATE
                putExtra(EXTRA_DEVICE_NAME, deviceName)
                putExtra(EXTRA_TEXT, text)
            }
            context.startService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, RideKeepAliveService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    private var deviceName: String = "Tripper"
    private var bodyText: String = "Linked — keeping the connection alive"

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        ensureChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForegroundCompat()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_DISCONNECT -> {
                TripperBleRuntime.requestDisconnect()
                stopForegroundCompat()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_UPDATE -> {
                applyExtras(intent)
                // Ensure we remain a foreground service even if update raced ahead of START.
                startAsForeground()
                return START_STICKY
            }
            else -> {
                applyExtras(intent)
                startAsForeground()
                return START_STICKY
            }
        }
    }

    private fun applyExtras(intent: Intent?) {
        intent?.getStringExtra(EXTRA_DEVICE_NAME)?.takeIf { it.isNotBlank() }?.let {
            deviceName = it
        }
        intent?.getStringExtra(EXTRA_TEXT)?.takeIf { it.isNotBlank() }?.let {
            bodyText = it
        }
    }

    private fun startAsForeground() {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE,
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = getSystemService(NotificationManager::class.java) ?: return
        val existing = nm.getNotificationChannel(CHANNEL_ID)
        if (existing != null) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Ride session",
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Keeps Quicker Pod linked to your Tripper while you ride"
            setShowBadge(false)
        }
        nm.createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val contentPending = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or immutableFlag(),
        )

        val disconnectIntent = Intent(this, RideKeepAliveService::class.java).apply {
            action = ACTION_DISCONNECT
        }
        val disconnectPending = PendingIntent.getService(
            this,
            1,
            disconnectIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or immutableFlag(),
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .setContentTitle("Quicker Pod · $deviceName")
            .setContentText(bodyText)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bodyText))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(contentPending)
            .addAction(0, "Disconnect", disconnectPending)
            .build()
    }

    private fun immutableFlag(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE
        } else {
            0
        }
    }
}
