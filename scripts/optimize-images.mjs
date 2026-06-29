// One-time asset step (not part of `vite build`). Resizes oversized images down to
// a sane max width and recompresses them IN PLACE, preserving format and filename
// (the app references these by exact /images/... path). Only overwrites when the
// result is actually smaller. Re-run when source images change.
//
//   node scripts/optimize-images.mjs
//
// Note: all targets live in public/ (referenced by absolute URL), so a Vite image
// plugin can't touch them — this committed script is the supported path.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
// logo-didar.png is the source for PWA icons — leave it untouched.
const skip = new Set(["logo-didar.png"]);
// Hero/full-bleed art can be wider; cards/accents never display very large.
const wideHints = ["world-hero", "products-hero", "world-craft", "brand-story", "gallery", "hero", "IMG_"];
const MIN_BYTES = 20 * 1024;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

async function recompress(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file);
  if (skip.has(base)) return null;
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return null;

  const original = fs.readFileSync(file);
  if (original.length < MIN_BYTES) return null;

  const maxWidth = wideHints.some((h) => base.includes(h)) ? 1920 : 1280;
  let pipeline = sharp(original).rotate().resize({ width: maxWidth, withoutEnlargement: true });
  if (ext === ".png") pipeline = pipeline.png({ compressionLevel: 9, effort: 8 });
  else if (ext === ".webp") pipeline = pipeline.webp({ quality: 78 });
  else pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true });

  const out = await pipeline.toBuffer();
  if (out.length >= original.length) return { file: base, skipped: true, before: original.length, after: original.length };
  fs.writeFileSync(file, out);
  return { file: base, before: original.length, after: out.length };
}

let before = 0;
let after = 0;
let changed = 0;
for (const file of walk(root)) {
  const result = await recompress(file);
  if (!result) continue;
  before += result.before;
  after += result.after;
  if (!result.skipped) {
    changed += 1;
    console.log(`${result.file}: ${(result.before / 1024).toFixed(0)}KB -> ${(result.after / 1024).toFixed(0)}KB`);
  }
}
console.log(`\n${changed} images optimized. Total ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
