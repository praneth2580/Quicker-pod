#!/usr/bin/env bash
# Ask major/minor → bump versions → build & publish APK → update landing download URL → deploy web.
#
# Usage:
#   npm run deploy:app              # interactive: asks major or minor
#   npm run deploy:app -- minor     # non-interactive
#   npm run deploy:app -- major
#   DRY_RUN=1 npm run deploy:app
#   SKIP_WEB_DEPLOY=1 npm run deploy:app   # APK release only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-praneth2580}"
REPO="${GITHUB_REPO:-Quicker-pod}"
ASSET_NAME="quicker-pod.apk"
DRY_RUN="${DRY_RUN:-0}"
SKIP_WEB_DEPLOY="${SKIP_WEB_DEPLOY:-0}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "error: required command not found: $1" >&2
    exit 1
  }
}

need_cmd node
need_cmd curl
need_cmd git
need_cmd npm

# shellcheck source=android-env.sh
source "$(dirname "$0")/android-env.sh"
echo "==> Using JAVA_HOME=$JAVA_HOME"

token_from_remote() {
  local url userinfo
  url="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$url" =~ ^https://([^/@]+)@github\.com/ ]]; then
    userinfo="${BASH_REMATCH[1]}"
    if [[ "$userinfo" == *:* ]]; then
      echo "${userinfo#*:}"
    else
      echo "$userinfo"
    fi
    return 0
  fi
  echo ""
}

resolve_token() {
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    echo "$GITHUB_TOKEN"
    return
  fi
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "$GH_TOKEN"
    return
  fi
  if command -v gh >/dev/null 2>&1; then
    local gh_token
    gh_token="$(gh auth token 2>/dev/null || true)"
    if [[ -n "$gh_token" ]]; then
      echo "$gh_token"
      return
    fi
  fi
  token_from_remote
}

warn_if_token_in_remote() {
  local url
  url="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$url" =~ ^https://[^/@]+@github\.com/ ]]; then
    echo "warning: origin remote embeds GitHub credentials in the URL." >&2
    echo "  Prefer: export GITHUB_TOKEN=…  then:" >&2
    echo "    git remote set-url origin https://github.com/${OWNER}/${REPO}.git" >&2
  fi
}

api_curl() {
  local method="$1"
  local url="$2"
  shift 2
  local tmp http_code
  tmp="$(mktemp)"
  http_code="$(curl -sS -o "$tmp" -w "%{http_code}" \
    -X "$method" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@" \
    "$url" || true)"
  if [[ ! "$http_code" =~ ^2 ]]; then
    echo "error: GitHub API ${method} ${url} → HTTP ${http_code}" >&2
    head -c 2000 "$tmp" >&2 || true
    echo >&2
    rm -f "$tmp"
    return 1
  fi
  cat "$tmp"
  rm -f "$tmp"
}

CURRENT="$(node -p "require('./package.json').version")"
if [[ ! "$CURRENT" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "error: package.json version must be semver X.Y.Z (got $CURRENT)" >&2
  exit 1
fi

BUMP="${1:-}"
if [[ -z "$BUMP" ]]; then
  if [[ ! -r /dev/tty ]]; then
    echo "error: pass bump type when non-interactive: npm run deploy:app -- major|minor" >&2
    exit 1
  fi
  echo ""
  echo "Current app version: ${CURRENT}"
  echo "How should we bump for this deploy?"
  echo "  major  — breaking / big release"
  echo "  minor  — new features"
  echo ""
  read -r -p "Enter major or minor: " BUMP </dev/tty
fi

BUMP="$(echo "$BUMP" | tr '[:upper:]' '[:lower:]' | xargs)"
IFS=. read -r MAJOR MINOR PATCH <<<"$CURRENT"
case "$BUMP" in
  major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
  minor) NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
  *)
    echo "error: bump must be 'major' or 'minor' (got '${BUMP}')" >&2
    exit 1
    ;;
esac

TAG="v${NEW_VERSION}"
CURRENT_CODE="$(grep -E '^\s*versionCode\s+[0-9]+' android/app/build.gradle | head -1 | grep -oE '[0-9]+$' || true)"
if [[ -z "$CURRENT_CODE" ]]; then
  CURRENT_CODE=1
fi
NEW_CODE=$((CURRENT_CODE + 1))
DOWNLOAD_URL="https://github.com/${OWNER}/${REPO}/releases/download/${TAG}/${ASSET_NAME}"
PUBLISHED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
API="https://api.github.com/repos/${OWNER}/${REPO}"

echo ""
echo "==> App deploy plan"
echo "    bump             ${BUMP}"
echo "    package.json     ${CURRENT} → ${NEW_VERSION}"
echo "    Android versionName → ${NEW_VERSION}"
echo "    Android versionCode ${CURRENT_CODE} → ${NEW_CODE}"
echo "    tag              ${TAG}"
echo "    APK              ${ASSET_NAME}"
echo "    download URL     ${DOWNLOAD_URL}"
echo "    then             update landing apk-latest.json + npm run deploy:web"
echo ""

if [[ "$DRY_RUN" == "1" ]]; then
  echo "==> DRY_RUN=1 — stopping before mutations"
  exit 0
fi

if [[ -r /dev/tty ]]; then
  read -r -p "Continue? [y/N] " CONFIRM </dev/tty
  case "$CONFIRM" in
    y|Y|yes|YES) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

TOKEN="$(resolve_token)"
if [[ -z "$TOKEN" ]]; then
  echo "error: no GitHub credentials for the Releases API." >&2
  echo "  export GITHUB_TOKEN=… with repo scope, or: gh auth login" >&2
  exit 1
fi
warn_if_token_in_remote

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree is dirty. Commit or stash before deploy:app." >&2
  git status --short
  exit 1
fi

if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  echo "error: local tag ${TAG} already exists." >&2
  exit 1
fi

if git ls-remote --exit-code --tags origin "refs/tags/${TAG}" >/dev/null 2>&1; then
  echo "error: remote tag ${TAG} already exists on origin." >&2
  exit 1
fi

echo "==> Bumping versions"
node <<EOF
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.version = "${NEW_VERSION}";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
EOF

for plugin_pkg in plugins/tripper-ble/package.json plugins/nav-notifications/package.json; do
  if [[ -f "$plugin_pkg" ]]; then
    node <<EOF
const fs = require("fs");
const p = "${plugin_pkg}";
const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
pkg.version = "${NEW_VERSION}";
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");
EOF
  fi
done

node <<EOF
const fs = require("fs");
const path = "android/app/build.gradle";
let text = fs.readFileSync(path, "utf8");
let n1 = 0;
let n2 = 0;
text = text.replace(/versionCode\s+\d+/, () => {
  n1 += 1;
  return "versionCode ${NEW_CODE}";
});
text = text.replace(/versionName\s+("[^"]*"|'[^']*')/, () => {
  n2 += 1;
  return 'versionName "${NEW_VERSION}"';
});
if (n1 !== 1 || n2 !== 1) {
  throw new Error(\`failed to patch versionCode/versionName (code=\${n1}, name=\${n2})\`);
}
fs.writeFileSync(path, text);
EOF

mkdir -p public
cat > public/apk-latest.json <<EOF
{
  "version": "${NEW_VERSION}",
  "versionCode": ${NEW_CODE},
  "tag": "${TAG}",
  "assetName": "${ASSET_NAME}",
  "downloadUrl": "${DOWNLOAD_URL}",
  "releasesPageUrl": "https://github.com/${OWNER}/${REPO}/releases/tag/${TAG}",
  "publishedAt": "${PUBLISHED_AT}"
}
EOF

echo "==> Building release APK"
bash scripts/build-apk.sh

APK_PATH="dist-apk/${ASSET_NAME}"
if [[ ! -f "$APK_PATH" ]]; then
  echo "error: missing $APK_PATH" >&2
  exit 1
fi

echo "==> Committing version bump + landing download metadata"
git add package.json android/app/build.gradle public/apk-latest.json
git add plugins/tripper-ble/package.json plugins/nav-notifications/package.json 2>/dev/null || true
git commit -m "$(cat <<EOF
release: ${TAG}

Bump app to ${NEW_VERSION} (versionCode ${NEW_CODE}) and refresh landing APK download URL.
EOF
)"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMIT_SHA="$(git rev-parse HEAD)"
echo "==> Pushing ${BRANCH} and tag ${TAG}"
git push -u origin "HEAD:${BRANCH}"
git tag -a "$TAG" -m "Quicker-pod ${TAG}"
git push origin "$TAG"

echo "==> Creating GitHub Release ${TAG}"
RELEASE_JSON=""
if RELEASE_JSON="$(api_curl GET "${API}/releases/tags/${TAG}" 2>/dev/null)"; then
  echo "    Release for ${TAG} already exists — will replace APK asset if present"
else
  if ! RELEASE_JSON="$(api_curl POST "${API}/releases" \
    -H "Content-Type: application/json" \
    -d "$(node -p "JSON.stringify({
      tag_name: '${TAG}',
      target_commitish: '${COMMIT_SHA}',
      name: 'Quicker-pod ${TAG}',
      body: 'Android APK ${NEW_VERSION} (versionCode ${NEW_CODE}).\\n\\nDownload: ${DOWNLOAD_URL}',
      draft: false,
      prerelease: false
    })")")"; then
    echo "    Create raced (likely CI) — fetching existing release"
    RELEASE_JSON="$(api_curl GET "${API}/releases/tags/${TAG}")"
  fi
fi

UPLOAD_URL="$(node -e "const r=JSON.parse(process.argv[1]); if(!r.upload_url) process.exit(2); process.stdout.write(String(r.upload_url).split('{')[0])" "$RELEASE_JSON")"
RELEASE_HTML="$(node -e "const r=JSON.parse(process.argv[1]); process.stdout.write(r.html_url||'')" "$RELEASE_JSON")"

EXISTING_ASSET_ID="$(node -e "
const r=JSON.parse(process.argv[1]);
const name=process.argv[2];
const a=(r.assets||[]).find(x => x.name === name);
process.stdout.write(a ? String(a.id) : '');
" "$RELEASE_JSON" "$ASSET_NAME")"
if [[ -n "$EXISTING_ASSET_ID" ]]; then
  echo "==> Removing previous ${ASSET_NAME} from release"
  api_curl DELETE "${API}/releases/assets/${EXISTING_ASSET_ID}" >/dev/null
fi

echo "==> Uploading ${ASSET_NAME}"
api_curl POST "${UPLOAD_URL}?name=${ASSET_NAME}&label=${ASSET_NAME}" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary @"${APK_PATH}" \
  >/dev/null

if [[ "$SKIP_WEB_DEPLOY" != "1" ]]; then
  echo "==> Updating landing page download URL (apk-latest.json) + deploying web"
  if ! npm run deploy:web; then
    echo "warning: deploy:web failed. GitHub Release + APK are published." >&2
    echo "  Retry: npm run deploy:web" >&2
    echo "  APK:   ${DOWNLOAD_URL}" >&2
  fi
fi

echo ""
echo "==> Done"
echo "    Release:  ${RELEASE_HTML:-https://github.com/${OWNER}/${REPO}/releases/tag/${TAG}}"
echo "    Download: ${DOWNLOAD_URL}"
echo "    Landing:  https://${OWNER}.github.io/${REPO}/"
