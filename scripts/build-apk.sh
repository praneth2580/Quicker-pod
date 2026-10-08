#!/usr/bin/env bash
# Build a release APK via Capacitor + Gradle → dist-apk/quicker-pod-<version>.apk
#
# Version: APK_VERSION env, first arg, or package.json
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=android-env.sh
source "$(dirname "$0")/android-env.sh"
echo "==> Using JAVA_HOME=$JAVA_HOME"

VERSION="${APK_VERSION:-${1:-}}"
if [[ -z "$VERSION" ]]; then
  VERSION="$(node -p "require('./package.json').version")"
fi
VERSION="${VERSION#v}"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
  echo "error: invalid APK version '${VERSION}' (expected semver X.Y.Z)" >&2
  exit 1
fi
VERSION="$(echo "$VERSION" | grep -oE '^[0-9]+\.[0-9]+\.[0-9]+')"
ASSET_NAME="quicker-pod-${VERSION}.apk"

if [[ ! -d android ]]; then
  echo "error: android/ is missing. Run: npx cap add android && npm run build:app" >&2
  exit 1
fi

if [[ ! -x android/gradlew ]]; then
  echo "error: android/gradlew not found or not executable." >&2
  exit 1
fi

echo "==> Refreshing Android launcher icons from public/icon.svg"
node scripts/generate-android-icons.mjs

echo "==> Building app web assets + Capacitor sync"
bash scripts/build-app.sh

echo "==> Assembling Android release APK"
(
  cd android
  ./gradlew assembleRelease --no-daemon
)

APK_SRC="android/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK_SRC" ]]; then
  APK_SRC="$(find android/app/build/outputs/apk/release -name '*.apk' | head -n 1 || true)"
fi

if [[ -z "${APK_SRC}" || ! -f "$APK_SRC" ]]; then
  echo "error: release APK not found under android/app/build/outputs/apk/release/" >&2
  exit 1
fi

mkdir -p dist-apk
rm -f dist-apk/quicker-pod-*.apk
cp -f "$APK_SRC" "dist-apk/${ASSET_NAME}"
echo "==> Wrote dist-apk/${ASSET_NAME}"
ls -lh "dist-apk/${ASSET_NAME}"
