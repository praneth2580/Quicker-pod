#!/usr/bin/env bash
# Build a release APK via Capacitor + Gradle and copy it to
# dist-apk/quicker-pod-<version>.apk          (APK_FLAVOR=core, default — Play Protect safe)
# dist-apk/quicker-pod-<version>-maps.apk     (APK_FLAVOR=maps — NotificationListener)
#
# Version: APK_VERSION env, first arg, or package.json
# Flavor:  APK_FLAVOR=core|maps (default core)
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

FLAVOR="${APK_FLAVOR:-core}"
FLAVOR="$(echo "$FLAVOR" | tr '[:upper:]' '[:lower:]')"
case "$FLAVOR" in
  core) ASSET_NAME="quicker-pod-${VERSION}.apk" ;;
  maps) ASSET_NAME="quicker-pod-${VERSION}-maps.apk" ;;
  *)
    echo "error: APK_FLAVOR must be 'core' or 'maps' (got '${FLAVOR}')" >&2
    exit 1
    ;;
esac
FLAVOR_CAP="$(echo "${FLAVOR:0:1}" | tr '[:lower:]' '[:upper:]')${FLAVOR:1}"
GRADLE_TASK="assemble${FLAVOR_CAP}Release"

if [[ ! -d android ]]; then
  echo "error: android/ is missing. Run: npx cap add android && npm run build:app" >&2
  exit 1
fi

if [[ ! -x android/gradlew ]]; then
  echo "error: android/gradlew not found or not executable." >&2
  exit 1
fi

if [[ "${SKIP_WEB_BUILD:-0}" != "1" ]]; then
  echo "==> Refreshing Android launcher icons from public/icon.svg"
  node scripts/generate-android-icons.mjs

  echo "==> Building app web assets + Capacitor sync"
  bash scripts/build-app.sh
else
  echo "==> SKIP_WEB_BUILD=1 — reusing synced android/ assets"
fi

echo "==> Assembling Android ${FLAVOR} release APK (${GRADLE_TASK})"
(
  cd android
  ./gradlew "${GRADLE_TASK}" --no-daemon
)

APK_SRC="android/app/build/outputs/apk/${FLAVOR}/release/app-${FLAVOR}-release.apk"
if [[ ! -f "$APK_SRC" ]]; then
  APK_SRC="$(find "android/app/build/outputs/apk/${FLAVOR}/release" -name '*.apk' 2>/dev/null | head -n 1 || true)"
fi

if [[ -z "${APK_SRC}" || ! -f "$APK_SRC" ]]; then
  echo "error: release APK not found under android/app/build/outputs/apk/${FLAVOR}/release/" >&2
  exit 1
fi

mkdir -p dist-apk
cp -f "$APK_SRC" "dist-apk/${ASSET_NAME}"
echo "==> Wrote dist-apk/${ASSET_NAME}"
ls -lh "dist-apk/${ASSET_NAME}"
