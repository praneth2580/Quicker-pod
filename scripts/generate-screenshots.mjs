import sharp from "sharp";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/screenshots");

const shots = [
  { input: "mobile-narrow.svg", output: "mobile-narrow.png", width: 390, height: 844 },
  { input: "mobile-wide.svg", output: "mobile-wide.png", width: 1280, height: 720 },
];

for (const shot of shots) {
  const svg = readFileSync(resolve(outDir, shot.input));
  await sharp(svg).resize(shot.width, shot.height).png().toFile(resolve(outDir, shot.output));
  console.log(`generated ${shot.output}`);
}

// Keep favicon.svg in sync with master icon for browsers that use SVG favicon
const iconSvg = readFileSync(resolve(root, "public/icon.svg"));
await sharp(iconSvg).resize(32, 32).png().toFile(resolve(root, "public/favicon-32.png"));
console.log("generated favicon-32.png");
