// One-time asset step. Generates real PWA icons (192/512 + maskable) from the
// brand logo, centered on the brand background, instead of reusing logo-didar.png
// at every size. Re-run if the logo changes.
//
//   node scripts/generate-icons.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const logoPath = path.join(publicDir, "images", "logo-didar.png");
const outDir = path.join(publicDir, "images");
const BRAND_BG = "#041E42";

async function makeIcon(size, logoScale, outName) {
  const logoSize = Math.round(size * logoScale);
  const logo = await sharp(logoPath)
    .resize({ width: logoSize, height: logoSize, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BRAND_BG } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(outDir, outName));
  console.log(`wrote ${outName} (${size}x${size})`);
}

// "any" icons fill more of the canvas; the maskable icon keeps the logo inside the
// ~80% safe zone so platform masks don't clip it.
await makeIcon(192, 0.7, "icon-192.png");
await makeIcon(512, 0.7, "icon-512.png");
await makeIcon(512, 0.55, "icon-maskable-512.png");
