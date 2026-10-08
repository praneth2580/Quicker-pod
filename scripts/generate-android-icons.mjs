#!/usr/bin/env node
/**
 * Rasterize public/icon.svg into Android legacy launcher mipmaps (API < 26).
 * Adaptive icons (v26+) use the vector drawable separately.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(root, "public", "icon.svg");
const resDir = path.join(root, "android", "app", "src", "main", "res");

const densities = [
  { folder: "mipmap-mdpi", launcher: 48, foreground: 108 },
  { folder: "mipmap-hdpi", launcher: 72, foreground: 162 },
  { folder: "mipmap-xhdpi", launcher: 96, foreground: 216 },
  { folder: "mipmap-xxhdpi", launcher: 144, foreground: 324 },
  { folder: "mipmap-xxxhdpi", launcher: 192, foreground: 432 },
];

const svg = await readFile(svgPath);

async function writePng(outPath, size) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 20, g: 32, b: 28, alpha: 1 } })
    .png()
    .toBuffer();
  await writeFile(outPath, buf);
}

for (const d of densities) {
  const dir = path.join(resDir, d.folder);
  await mkdir(dir, { recursive: true });
  await writePng(path.join(dir, "ic_launcher.png"), d.launcher);
  await writePng(path.join(dir, "ic_launcher_round.png"), d.launcher);
  await writePng(path.join(dir, "ic_launcher_foreground.png"), d.foreground);
  console.log(`wrote ${d.folder} (${d.launcher} / fg ${d.foreground})`);
}

console.log("Android launcher icons updated from public/icon.svg");
