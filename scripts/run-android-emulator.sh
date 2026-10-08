#!/usr/bin/env bash
# Sync Capacitor web assets, start an AVD if needed, build debug APK, install + launch.
# No Android Studio — terminal + emulator only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=android-env.sh
source "$(dirname "$0")/android-env.sh"
echo "==> Using JAVA_HOME=$JAVA_HOME"

APP_ID="com.quickerpod.app"
ACTIVITY=".MainActivity"
AVD_NAME="${ANDROID_AVD:-}"
SKIP_SYNC="${SKIP_SYNC:-0}"

ADB="${ANDROID_HOME}/platform-tools/adb"
EMULATOR_BIN="${ANDROID_HOME}/emulator/emulator"

if [[ ! -x "$ADB" ]]; then
  echo "error: adb not found at $ADB (set ANDROID_HOME)" >&2
  exit 1
fi

if [[ ! -d android || ! -x android/gradlew ]]; then
  echo "error: android/ project missing. Run npm run build:app once first." >&2
  exit 1
fi

device_online() {
  "$ADB" devices | awk 'NR>1 && $2=="device" {print $1; exit}'
}

boot_completed() {
  local serial="$1"
  "$ADB" -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' | grep -qx "1"
}

wait_for_boot() {
  echo "==> Waiting for Android device/emulator..."
  "$ADB" wait-for-device
  local serial=""
  local i=0
  while true; do
    serial="$(device_online)"
    if [[ -n "$serial" ]] && boot_completed "$serial"; then
      echo "==> Device ready: $serial"
      return 0
    fi
    i=$((i + 1))
    if [[ $i -gt 120 ]]; then
      echo "error: timed out waiting for emulator boot" >&2
      exit 1
    fi
    sleep 2
  done
}

start_emulator_if_needed() {
  if [[ -n "$(device_online)" ]]; then
    echo "==> Using already-running device: $(device_online)"
    return 0
  fi

  if [[ ! -x "$EMULATOR_BIN" ]]; then
    echo "error: emulator binary not found at $EMULATOR_BIN" >&2
    exit 1
  fi

  if [[ -z "$AVD_NAME" ]]; then
    AVD_NAME="$("$EMULATOR_BIN" -list-avds | head -n 1 || true)"
  fi
  if [[ -z "$AVD_NAME" ]]; then
    echo "error: no AVDs found. Create one in SDK Manager, or set ANDROID_AVD=YourAvdName" >&2
    exit 1
  fi

  echo "==> Starting emulator: $AVD_NAME"
  # -no-snapshot-save keeps CI-ish runs simpler; GUI window still opens for the AVD
  "$EMULATOR_BIN" -avd "$AVD_NAME" -netdelay none -netspeed full >/tmp/quicker-pod-emulator.log 2>&1 &
  echo "==> Emulator log: /tmp/quicker-pod-emulator.log"
}

if [[ "$SKIP_SYNC" != "1" ]]; then
  echo "==> Building app + Capacitor sync"
  bash scripts/build-app.sh
else
  echo "==> SKIP_SYNC=1 — skipping build:app"
fi

start_emulator_if_needed
wait_for_boot

echo "==> Building + installing core debug APK"
(
  cd android
  ./gradlew installCoreDebug --no-daemon
)

echo "==> Launching $APP_ID"
"$ADB" shell am start -n "${APP_ID}/${ACTIVITY}"

echo "==> Done. Logcat: adb logcat -s TripperBle:* Capacitor:* chromium:*"
