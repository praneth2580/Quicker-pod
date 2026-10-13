/**
 * After Vite builds dist-site/, emit per-route index.html shells with unique
 * title/description/canonical so GitHub Pages + crawlers see correct meta
 * before React hydrates (SPA still boots from the same JS bundle).
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist-site");
const SITE = "https://praneth2580.github.io/Quicker-pod";

const ROUTES = [
  {
    dir: "vs-supertripper",
    title: "Quicker-pod vs SuperTripper — Free Tripper Pod Alternative",
    description:
      "Compare Quicker-pod with SuperTripper / Super TripperPod for Royal Enfield Tripper Pod: free open-source APK, Google Maps turn mirroring, and BLE pairing without an account wall.",
  },
  {
    dir: "install",
    title: "Install Quicker-pod — Tripper Pod APK Setup",
    description:
      "Install Quicker-pod on Android: download the free Tripper Pod APK, sideload past Play Protect, enable notification access, and mirror Google Maps turns to your Royal Enfield Tripper Pod.",
  },
  {
    dir: "faq",
    title: "FAQ — Tripper Pod APK & SuperTripper Alternative",
    description:
      "FAQ for Quicker-pod: free Tripper Pod APK, SuperTripper alternative, Google Maps mirroring, Play Protect, and Royal Enfield Tripper Pod BLE pairing.",
  },
];

function replaceMeta(html, { title, description, url }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`,
  );
  out = out.replace(
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`,
  );
  out = out.replace(
    /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url}" />`,
  );
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${description}" />`,
  );
  return out;
}

const indexPath = path.join(OUT, "index.html");
if (!existsSync(indexPath)) {
  console.error("seo-static-routes: dist-site/index.html missing — run vite build first");
  process.exit(1);
}

const baseHtml = readFileSync(indexPath, "utf8");

for (const route of ROUTES) {
  const dir = path.join(OUT, route.dir);
  mkdirSync(dir, { recursive: true });
  const url = `${SITE}/${route.dir}`;
  const html = replaceMeta(baseHtml, {
    title: route.title,
    description: route.description,
    url,
  });
  writeFileSync(path.join(dir, "index.html"), html);
  console.log(`  seo: ${route.dir}/index.html`);
}

// Keep SPA deep-link fallback for unknown paths
copyFileSync(indexPath, path.join(OUT, "404.html"));
console.log("  seo: 404.html (SPA fallback)");
