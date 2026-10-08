#!/usr/bin/env bash
# Bump version → build APK → publish GitHub Release → update apk-latest.json → deploy site.
#
# Usage:
#   npm run release              # patch bump (0.1.0 → 0.1.1)
#   npm run release -- minor     # 0.1.0 → 0.2.0
#   npm run release -- major     # 0.1.0 → 1.0.0
#   npm run release -- 1.2.3     # set exact version
#   DRY_RUN=1 npm run release    # print actions only
#   SKIP_DEPLOY=1 npm run release  # skip gh-pages deploy
#
# Auth (first match wins): GITHUB_TOKEN, GH_TOKEN, `gh auth token`, or HTTPS
# credentials embedded in `origin` (not printed). Prefer env/`gh`; clean tokens
# out of the remote URL when you can.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-praneth2580}"
REPO="${GITHUB_REPO:-Quicker-pod}"
ASSET_NAME="quicker-pod.apk"
DRY_RUN="${DRY_RUN:-0}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"
BUMP="${1:-patch}"

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

# JDK 21 + ANDROID_HOME for the APK build (also sourced by build-apk.sh).
# shellcheck source=android-env.sh
source "$(dirname "$0")/android-env.sh"
echo "==> Using JAVA_HOME=$JAVA_HOME"

token_from_remote() {
  local url userinfo
  url="$(git remote get-url origin 2>/dev/null || true)"
  # https://USER:PASS@host/… or https://TOKEN@host/…
  if [[ "$url" =~ ^https://([^/@]+)@github\.com/ ]]; then
    userinfo="${BASH_REMATCH[1]}"
    # user:pass → use pass; bare token → use as-is
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
    echo "  Prefer: export GITHUB_TOKEN=…  (or: gh auth login)" >&2
    echo "  Then clean the remote (does not print the secret):" >&2
    echo "    git remote set-url origin https://github.com/${OWNER}/${REPO}.git" >&2
  fi
}

api_curl() {
  # Usage: api_curl METHOD URL [curl args…]
  # Prints body on stdout; on HTTP error prints body to stderr and exits 1.
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
    # Never dump Authorization headers; body is safe enough for diagnosis.
    head -c 2000 "$tmp" >&2 || true
    echo >&2
    rm -f "$tmp"
    return 1
  fi
  cat "$tmp"
  rm -f "$tmp"
}

TOKEN="$(resolve_token)"
if [[ -z "$TOKEN" && "$DRY_RUN" != "1" ]]; then
  echo "error: no GitHub credentials for the Releases API." >&2
  echo "  export GITHUB_TOKEN=… with repo scope, or install gh and run: gh auth login" >&2
  exit 1
fi
warn_if_token_in_remote

CURRENT="$(node -p "require('./package.json').version")"
if [[ ! "$CURRENT" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "error: package.json version must be semver X.Y.Z (got $CURRENT)" >&2
  exit 1
fi

IFS=. read -r MAJOR MINOR PATCH <<<"$CURRENT"
case "$BUMP" in
  patch) NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
  minor) NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
  major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
  *)
    if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      NEW_VERSION="$BUMP"
    else
      echo "error: unknown bump '$BUMP' (use patch|minor|major|X.Y.Z)" >&2
      exit 1
    fi
    ;;
esac

TAG="v${NEW_VERSION}"
CURRENT_CODE="$(grep -E '^\s*versionCode\s+[0-9]+' android/app/build.gradle | head -1 | grep -oE '[0-9]+$')"
if [[ -z "$CURRENT_CODE" ]]; then
  CURRENT_CODE=1
fi
NEW_CODE=$((CURRENT_CODE + 1))
DOWNLOAD_URL="https://github.com/${OWNER}/${REPO}/releases/download/${TAG}/${ASSET_NAME}"
PUBLISHED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
API="https://api.github.com/repos/${OWNER}/${REPO}"

echo "==> Release plan"
echo "    package.json     $CURRENT → $NEW_VERSION"
echo "    Android versionName → $NEW_VERSION"
echo "    Android versionCode $CURRENT_CODE → $NEW_CODE"
echo "    tag              $TAG"
echo "    asset            $ASSET_NAME"
echo "    download URL     $DOWNLOAD_URL"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "==> DRY_RUN=1 — stopping before mutations"
  exit 0
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree is dirty. Commit or stash before releasing." >&2
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
const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.version = "${NEW_VERSION}";
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
EOF

# Keep plugin package version in sync when present
if [[ -f plugins/tripper-ble/package.json ]]; then
  node <<EOF
const fs = require("fs");
const p = "plugins/tripper-ble/package.json";
const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
pkg.version = "${NEW_VERSION}";
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");
EOF
fi

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

echo "==> Building APK"
npm run build:apk

APK_PATH="dist-apk/${ASSET_NAME}"
if [[ ! -f "$APK_PATH" ]]; then
  echo "error: missing $APK_PATH" >&2
  exit 1
fi

echo "==> Committing version bump"
git add package.json android/app/build.gradle public/apk-latest.json
if [[ -f plugins/tripper-ble/package.json ]]; then
  git add plugins/tripper-ble/package.json
fi
git commit -m "$(cat <<EOF
release: ${TAG}

Bump app version to ${NEW_VERSION} (versionCode ${NEW_CODE}) and refresh APK download metadata.
EOF
)"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMIT_SHA="$(git rev-parse HEAD)"
echo "==> Pushing ${BRANCH} and tag ${TAG}"
git push -u origin "HEAD:${BRANCH}"
git tag -a "$TAG" -m "Quicker-pod ${TAG}"
git push origin "$TAG"

# Tag push may start CI's Release APK workflow in parallel; create-or-update
# below is idempotent (replace same-named asset) so both paths can coexist.
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
RELEASE_ID="$(node -e "const r=JSON.parse(process.argv[1]); process.stdout.write(String(r.id||''))" "$RELEASE_JSON")"

# Replace prior asset with the same name (idempotent re-runs / CI race).
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

if [[ "$SKIP_DEPLOY" != "1" ]]; then
  echo "==> Deploying static site (gh-pages) with apk-latest.json"
  if ! npm run deploy; then
    echo "warning: gh-pages deploy failed. GitHub Release + APK are published." >&2
    echo "  Retry with: npm run deploy" >&2
    echo "  Or open: ${DOWNLOAD_URL}" >&2
  fi
fi

echo ""
echo "==> Done"
echo "    Release:  ${RELEASE_HTML:-https://github.com/${OWNER}/${REPO}/releases/tag/${TAG}}"
echo "    Download: ${DOWNLOAD_URL}"
echo "    Landing:  https://${OWNER}.github.io/${REPO}/"
echo "    Static:   public/apk-latest.json → version ${NEW_VERSION}"
if [[ -n "${RELEASE_ID}" ]]; then
  echo "    Release id: ${RELEASE_ID}"
fi
