# Google Maps → Tripper notification mirroring

Quicker Pod can mirror **Google Maps** (and optionally Waze) turn-by-turn guidance to a paired Tripper Pod by reading Android navigation notifications.

This matches the product path used by third-party RE companions: a `NotificationListenerService` parses Maps banners, then the app writes Tripper nav packets (with keepalive) over the existing BLE path.

## Architecture

```
Google Maps (nav notification)
        │
        ▼
MapsNotificationListener  (plugins/nav-notifications)
        │  parse title/text → distance + maneuver
        ▼
NavNotifications Capacitor plugin  →  JS `navUpdate` event
        │
        ▼
mapsNavBridge.ts  →  tripperNavSession.applyExternalNavUpdate()
        │
        ▼
Tripper BLE write + keepalive (unchanged pairing/GATT server)
```

| Layer | Role |
|-------|------|
| `plugins/nav-notifications` | Android `NotificationListenerService` + Capacitor bridge |
| `src/navigation/mapsNavBridge.ts` | Subscribes to events, updates UI store, calls nav session |
| `src/bluetooth/tripper/navSession.ts` | Builds / writes nav packets; keepalive |

Web builds expose a stub: status is `supported: false` and settings show **Android only**.

## One APK

There is a single release APK (`quicker-pod-X.Y.Z.apk`) with BLE pairing and Maps notification mirroring. The merged release manifest always includes `MapsNotificationListener` with `BIND_NOTIFICATION_LISTENER_SERVICE` (service protection) and the `NotificationListenerService` intent filter.

Play Protect may warn on **browser** installs because the APK declares a Notification Listener (“sensitive data”). Tap **Install anyway** if shown — ADB/Play Store are not required for the listener to work.

### Why ADB/Play vs sideload can feel different

Notification Listener is **Special App Access**, not a runtime permission. On **Android 13+**, apps installed from unknown sources (manual APK / Files / browser) often cannot flip the Notification access toggle until the user enables **App info → ⋮ → Allow restricted settings**. Installs via **ADB** or **Play Store** typically skip that gate. The app cannot grant or bypass this; it only opens Settings and re-checks `ENABLED_NOTIFICATION_LISTENERS` when you return.

## Enable notification access (device)

1. Install / run the Quicker Pod **Android APK** (Capacitor) — any normal install path.
2. If the Notification access toggle is greyed out (Android 13+ sideload): Settings → Apps → Quicker Pod → ⋮ → **Allow restricted settings**.
3. Open **Navigate** or **Settings → Notification Access**.
4. Tap **Enable Notification Access** (opens `ACTION_NOTIFICATION_LISTENER_SETTINGS`, or the per-app detail page on API 30+).
5. Select **Quicker Pod** and turn access **on** yourself.
6. Return to the app — status is re-checked on resume (or tap **Refresh status**). Do not assume grant just because Settings closed.
7. Pair / reconnect your Tripper on **Connect**.
8. Leave **Forward to Tripper** on (Navigate / Settings).

## Test with Google Maps

1. Confirm Navigate shows listener **Listening** (or at least **Enabled**).
2. Confirm Tripper is **Connected**.
3. Open Google Maps → start **turn-by-turn navigation** to a nearby destination.
4. Keep Maps in the foreground or with an active nav notification.
5. On Navigate, the hero should show the next turn text / distance.
6. The Tripper display should update; keepalive re-sends the last nav frame every ~1s.
7. End navigation in Maps — Quicker Pod should send **STOP NAV** and turn keepalive off.

### Manual fallback

If Maps text cannot be parsed (locale / layout change), use **Navigate → Manual guidance** to send Google maneuvers directly.

## Parsing notes

- Packages watched: `com.google.android.apps.maps`, Maps Lite, `com.waze`.
- Prefer `Notification.extras` (`EXTRA_TITLE`, `EXTRA_TEXT`, `EXTRA_BIG_TEXT`, …).
- Distance phrases like `200 m`, `0.5 km`, `1.2 mi` → meters.
- Turn phrases mapped to existing `GOOGLE_MANEUVERS` names (`TURN_LEFT`, `KEEP_RIGHT`, …).
- Maps UI strings change by version and language — parsing is best-effort.

## Residual limitations

- No official Google Navigation SDK (that requires API keys / licensing).
- RemoteViews-only layouts on older Maps builds may yield empty extras; extend the native parser if needed.
- Non-English instructions may fall back to straight / unknown until more locale rules are added.
- Waze support is package-filtered; phrasing may differ from Maps.

## Related files

- Plugin: `plugins/nav-notifications/`
- Bridge: `src/navigation/mapsNavBridge.ts`
- UI: `src/pages/NavigatePage.tsx`, `src/pages/SettingsPage.tsx`
- Protocol: `tripper-protocol/*/navigation.md`
