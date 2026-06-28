import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const sourceRoots = ["src", "server"];
const textFiles = ["index.html", "render.yaml", ".env.example", "package.json"];
const heavyAssetBytes = 500 * 1024;
const criticalAssetBytes = 2 * 1024 * 1024;

function bytes(value) {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "data"].includes(entry.name)) return [];
      return walkFiles(fullPath, predicate);
    }
    return predicate(fullPath) ? [fullPath] : [];
  });
}

function readSearchableSource() {
  const files = [
    ...sourceRoots.flatMap((dir) => walkFiles(path.join(root, dir), (file) => /\.(js|jsx|mjs|css|html|md|json|yaml|yml)$/i.test(file))),
    ...textFiles.map((file) => path.join(root, file)).filter((file) => fs.existsSync(file)),
  ];
  return files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
}

function auditPublicAssets() {
  const haystack = readSearchableSource();
  const files = walkFiles(publicDir, (file) => /\.(png|jpe?g|webp|gif|svg|mp4|webm|ttf|woff2?)$/i.test(file));
  return files
    .map((file) => {
      const relative = path.relative(publicDir, file).replaceAll("\\", "/");
      const publicPath = `/${relative}`;
      const size = fs.statSync(file).size;
      return {
        path: publicPath,
        size,
        usedInSource: haystack.includes(publicPath),
      };
    })
    .sort((a, b) => b.size - a.size);
}

async function auditDatabase() {
  const { db } = await import("../server/db.js");
  try {
    const tables = ["users", "catalog_items", "journal_articles", "cms_content", "media_assets", "inquiries"];
    const counts = {};
    for (const table of tables) {
      const row = await db.get(`SELECT COUNT(*) AS count FROM ${table}`);
      counts[table] = row.count;
    }

    const catalogByType = await db.all("SELECT item_type AS type, COUNT(*) AS count FROM catalog_items GROUP BY item_type");
    counts.catalogByType = Object.fromEntries(catalogByType.map((row) => [row.type, row.count]));
    return counts;
  } finally {
    await db.close();
  }
}

function printAssetReport(assets) {
  const heavy = assets.filter((asset) => asset.size >= heavyAssetBytes);
  const unusedCritical = heavy.filter((asset) => asset.size >= criticalAssetBytes && !asset.usedInSource);

  console.log("\nAsset readiness");
  console.log("----------------");
  console.log(`Public assets scanned: ${assets.length}`);
  console.log(`Heavy assets over ${bytes(heavyAssetBytes)}: ${heavy.length}`);
  console.log(`Unused critical assets over ${bytes(criticalAssetBytes)}: ${unusedCritical.length}`);

  for (const asset of heavy.slice(0, 12)) {
    const marker = asset.usedInSource ? "used" : "unused";
    console.log(`- ${asset.path} | ${bytes(asset.size)} | ${marker}`);
  }
}

function printDatabaseReport(counts) {
  console.log("\nDatabase readiness");
  console.log("------------------");
  console.log(`Products: ${counts.catalogByType.product || 0}`);
  console.log(`Collections: ${counts.catalogByType.collection || 0}`);
  console.log(`Journal articles: ${counts.journal_articles}`);
  console.log(`CMS entries: ${counts.cms_content}`);
  console.log(`Media assets: ${counts.media_assets}`);
  console.log(`Inquiries: ${counts.inquiries}`);

  const notes = [];
  if ((counts.catalogByType.product || 0) < 12) notes.push("Add the full commercial product catalog before launch.");
  if ((counts.catalogByType.collection || 0) < 3) notes.push("Collections need at least the three brand pillars.");
  if (counts.cms_content === 0) notes.push("CMS has no overrides yet; current site depends on code defaults.");
  if (counts.media_assets === 0) notes.push("Media library is empty; uploaded assets are not yet managed through admin.");

  if (notes.length) {
    console.log("\nRecommended content work");
    for (const note of notes) console.log(`- ${note}`);
  }
}

async function main() {
  console.log("Didar Gold launch audit");
  console.log("=======================");
  printAssetReport(auditPublicAssets());
  printDatabaseReport(await auditDatabase());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
