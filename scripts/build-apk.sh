#!/usr/bin/env bash
# Build a release APK via Capacitor + Gradle and copy it to dist-apk/quicker-pod.apk
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d android ]]; then
  echo "error: android/ is missing. Run Capacitor init / npm run cap:sync first." >&2
  exit 1
fi

if [[ ! -x android/gradlew ]]; then
  echo "error: android/gradlew not found or not executable." >&2
  exit 1
fi

echo "==> Building tripper-ble plugin + Capacitor web assets"
npm run cap:sync

echo "==> Assembling Android release APK"
(
  cd android
  ./gradlew assembleRelease --no-daemon
)

APK_SRC="android/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK_SRC" ]]; then
  # Some AGP layouts use app-release-unsigned.apk when unsigned
  APK_SRC="$(find android/app/build/outputs/apk/release -name '*.apk' | head -n 1 || true)"
fi

if [[ -z "${APK_SRC}" || ! -f "$APK_SRC" ]]; then
  echo "error: release APK not found under android/app/build/outputs/apk/release/" >&2
  exit 1
fi

mkdir -p dist-apk
cp -f "$APK_SRC" dist-apk/quicker-pod.apk
echo "==> Wrote dist-apk/quicker-pod.apk"
ls -lh dist-apk/quicker-pod.apk
