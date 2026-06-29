// One-time asset step (not part of `vite build`). Converts the in-use Doran TTF
// weights to WOFF2 (~50% smaller, lossless, no glyph subsetting so Persian/Arabic
// shaping is preserved). Re-run when the source TTFs change.
//
//   node scripts/optimize-fonts.mjs
//
// Note: deeper unicode-range subsetting (splitting Latin vs Arabic) is a possible
// follow-up but needs visual Persian QA — intentionally not done here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ttf2woff2 from "ttf2woff2";

const fontDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "font");
const usedWeights = ["Doran-Light", "Doran-Regular", "Doran-Medium", "Doran-Bold"];

let before = 0;
let after = 0;
for (const name of usedWeights) {
  const ttfPath = path.join(fontDir, `${name}.ttf`);
  if (!fs.existsSync(ttfPath)) {
    console.warn(`skip: ${name}.ttf not found`);
    continue;
  }
  const ttf = fs.readFileSync(ttfPath);
  const woff2 = ttf2woff2(ttf);
  const woff2Path = path.join(fontDir, `${name}.woff2`);
  fs.writeFileSync(woff2Path, woff2);
  before += ttf.length;
  after += woff2.length;
  console.log(`${name}: ${(ttf.length / 1024).toFixed(0)}KB ttf -> ${(woff2.length / 1024).toFixed(0)}KB woff2`);
}
console.log(`Total: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB woff2`);
