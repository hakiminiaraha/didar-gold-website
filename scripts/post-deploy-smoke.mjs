const productionUrl = process.env.PRODUCTION_URL || process.argv[2];

if (!productionUrl) {
  console.error("PRODUCTION_URL is required. Example: PRODUCTION_URL=https://didargold.com npm run audit:production");
  process.exit(1);
}

const baseUrl = productionUrl.replace(/\/$/, "");
const checks = [
  ["/", "homepage"],
  ["/collections", "collections"],
  ["/products", "products"],
  ["/shop", "shop"],
  ["/services", "services"],
  ["/our-world", "our world"],
  ["/art-gallery", "art gallery"],
  ["/journal", "journal"],
  ["/contact", "contact"],
  ["/api/health", "api health"],
  ["/api/catalog?type=product", "product catalog api"],
  ["/api/catalog?type=collection", "collection catalog api"],
  ["/robots.txt", "robots"],
  ["/sitemap.xml", "sitemap"],
];

const results = [];

for (const [path, label] of checks) {
  const url = `${baseUrl}${path}`;
  const startedAt = performance.now();
  try {
    const response = await fetch(url, { redirect: "manual" });
    const durationMs = Math.round(performance.now() - startedAt);
    const ok = response.status >= 200 && response.status < 400;
    results.push({ label, path, status: response.status, durationMs, ok });
  } catch (error) {
    results.push({ label, path, status: 0, durationMs: Math.round(performance.now() - startedAt), ok: false, error: error.message });
  }
}

const failed = results.filter((result) => !result.ok);

console.table(results);

if (failed.length) {
  console.error(`Production smoke test failed: ${failed.length} check(s) failed.`);
  process.exit(1);
}

console.log("Production smoke test passed.");
