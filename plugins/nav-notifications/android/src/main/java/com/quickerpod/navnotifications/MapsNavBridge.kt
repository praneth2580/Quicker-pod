package com.quickerpod.navnotifications

import java.util.concurrent.CopyOnWriteArrayList

/**
 * Process-wide bridge between [MapsNotificationListener] and [NavNotificationsPlugin].
 * The listener service and Capacitor plugin live in different Android components.
 */
object MapsNavBridge {
    interface Listener {
        fun onNavUpdate(parsed: MapsNavParser.ParsedNav)
        fun onListenerConnected(connected: Boolean)
    }

    private val listeners = CopyOnWriteArrayList<Listener>()
    @Volatile
    var serviceConnected: Boolean = false
        private set

    fun addListener(listener: Listener) {
        listeners.add(listener)
        listener.onListenerConnected(serviceConnected)
    }

    fun removeListener(listener: Listener) {
        listeners.remove(listener)
    }

    fun setServiceConnected(connected: Boolean) {
        serviceConnected = connected
        listeners.forEach { it.onListenerConnected(connected) }
    }

    fun emit(parsed: MapsNavParser.ParsedNav) {
        listeners.forEach { it.onNavUpdate(parsed) }
    }
}
