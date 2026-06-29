// Minimal exact-match router. Routes have no path params (all variability is in
// query strings), so a Map keyed by "METHOD /path" is all we need. A wrong
// method on a known path falls through to a 404 (not 405 + Allow) — this matches
// the original if-chain dispatch and is an intentional, documented limitation.
export function createRouter() {
  const routes = new Map();
  const add = (method, path, handler) => routes.set(`${method} ${path}`, handler);
  return {
    get: (p, h) => add("GET", p, h),
    post: (p, h) => add("POST", p, h),
    put: (p, h) => add("PUT", p, h),
    del: (p, h) => add("DELETE", p, h),
    match: (method, pathname) => routes.get(`${method} ${pathname}`) || null,
  };
}
