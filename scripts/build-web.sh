#!/usr/bin/env bash
# Build the marketing landing site → dist-site/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Generating PWA assets + typecheck + Vite site bundle"
pwa-assets-generator
node scripts/generate-screenshots.mjs
tsc -b
vite build
echo "==> Site build ready in dist-site/"
