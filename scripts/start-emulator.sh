#!/usr/bin/env bash
# Start the first (or ANDROID_AVD) emulator if none is already online.
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

ADB="${ANDROID_HOME}/platform-tools/adb"
EMULATOR_BIN="${ANDROID_HOME}/emulator/emulator"
AVD_NAME="${ANDROID_AVD:-}"

if [[ ! -x "$ADB" || ! -x "$EMULATOR_BIN" ]]; then
  echo "error: adb/emulator not found under $ANDROID_HOME" >&2
  exit 1
fi

online="$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1; exit}')"
if [[ -n "$online" ]]; then
  echo "Already running: $online"
  exit 0
fi

if [[ -z "$AVD_NAME" ]]; then
  AVD_NAME="$("$EMULATOR_BIN" -list-avds | head -n 1 || true)"
fi
if [[ -z "$AVD_NAME" ]]; then
  echo "error: no AVDs found. Create one, or set ANDROID_AVD=YourAvdName" >&2
  exit 1
fi

echo "Starting emulator: $AVD_NAME"
"$EMULATOR_BIN" -avd "$AVD_NAME" -netdelay none -netspeed full >/tmp/quicker-pod-emulator.log 2>&1 &
echo "Log: /tmp/quicker-pod-emulator.log"
"$ADB" wait-for-device
echo "Emulator booting (wait for home screen)…"
for i in $(seq 1 120); do
  serial="$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1; exit}')"
  if [[ -n "$serial" ]] && [[ "$("$ADB" -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; then
    echo "Ready: $serial"
    exit 0
  fi
  sleep 2
done
echo "error: timed out waiting for boot" >&2
exit 1
