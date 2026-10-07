#!/usr/bin/env bash
# Bump version → build APK → publish GitHub Release → deploy landing page with download link.
#
# Usage:
#   npm run release              # patch bump (0.1.0 → 0.1.1)
#   npm run release -- minor     # 0.1.0 → 0.2.0
#   npm run release -- major     # 0.1.0 → 1.0.0
#   npm run release -- 1.2.3     # set exact version
#   DRY_RUN=1 npm run release    # print actions only
#   SKIP_DEPLOY=1 npm run release  # skip gh-pages deploy
#
# Auth: set GITHUB_TOKEN (or GH_TOKEN) with `repo` scope. `gh` CLI also works if logged in.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-praneth2580}"
REPO="${GITHUB_REPO:-Quicker-pod}"
ASSET_NAME="quicker-pod.apk"
DRY_RUN="${DRY_RUN:-0}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"
BUMP="${1:-patch}"

redact() {
  sed -E 's/[A-Za-z0-9_-]{20,}/***/g'
}

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
    gh auth token 2>/dev/null && return
  fi
  echo ""
}

TOKEN="$(resolve_token)"
if [[ -z "$TOKEN" && "$DRY_RUN" != "1" ]]; then
  echo "error: set GITHUB_TOKEN (or GH_TOKEN) with repo scope to publish the release." >&2
  echo "  export GITHUB_TOKEN=ghp_..." >&2
  exit 1
fi

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

Bump app version to ${NEW_VERSION} (versionCode ${NEW_CODE}) and refresh landing APK metadata.
EOF
)"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "==> Pushing ${BRANCH} and tag ${TAG}"
git push -u origin "HEAD:${BRANCH}"
git tag -a "$TAG" -m "Quicker-pod ${TAG}"
git push origin "$TAG"

echo "==> Creating GitHub Release ${TAG}"
API="https://api.github.com/repos/${OWNER}/${REPO}"
RELEASE_JSON="$(curl -fsSL \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${API}/releases" \
  -d "$(node -p "JSON.stringify({
    tag_name: '${TAG}',
    name: 'Quicker-pod ${TAG}',
    body: 'Android APK ${NEW_VERSION} (versionCode ${NEW_CODE}).\\n\\nDownload: ${DOWNLOAD_URL}',
    draft: false,
    prerelease: false
  })")")"

UPLOAD_URL="$(node -e "const r=JSON.parse(process.argv[1]); if(!r.upload_url) process.exit(2); process.stdout.write(String(r.upload_url).split('{')[0])" "$RELEASE_JSON")"
RELEASE_HTML="$(node -e "const r=JSON.parse(process.argv[1]); process.stdout.write(r.html_url||'')" "$RELEASE_JSON")"

echo "==> Uploading ${ASSET_NAME}"
curl -fsSL \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary @"${APK_PATH}" \
  "${UPLOAD_URL}?name=${ASSET_NAME}&label=${ASSET_NAME}" \
  >/dev/null

if [[ "$SKIP_DEPLOY" != "1" ]]; then
  echo "==> Deploying landing page (gh-pages)"
  npm run deploy
fi

echo ""
echo "==> Done"
echo "    Release:  ${RELEASE_HTML:-https://github.com/${OWNER}/${REPO}/releases/tag/${TAG}}"
echo "    Download: ${DOWNLOAD_URL}"
echo "    Landing:  https://${OWNER}.github.io/${REPO}/"
echo "    Static:   public/apk-latest.json → version ${NEW_VERSION}"
