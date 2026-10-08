#!/usr/bin/env bash
# Deprecated alias — use: npm run deploy:app
exec "$(cd "$(dirname "$0")" && pwd)/deploy-app.sh" "$@"
