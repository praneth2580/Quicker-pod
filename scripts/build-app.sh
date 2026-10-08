#!/usr/bin/env bash
# Build the functional companion web bundle and sync into android/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building Capacitor plugins"
npm run build --prefix plugins/tripper-ble
npm run build --prefix plugins/nav-notifications

echo "==> Generating PWA assets + typecheck + Vite app bundle"
pwa-assets-generator
node scripts/generate-screenshots.mjs
CAPACITOR=1 tsc -b
CAPACITOR=1 vite build

if [[ ! -d android ]]; then
  echo "error: android/ is missing. Run: npx cap add android" >&2
  exit 1
fi

echo "==> Capacitor sync android"
npx cap sync android
echo "==> App build ready in dist/ (synced to android/)"
