// Imperatively update <head> tags for per-route SEO (title/description/og/canonical).
// Kept in a plain module so the React Compiler treats these DOM writes as opaque
// side effects rather than render-time mutations.
export function setRouteMeta({ title, description, image, url }) {
  if (title) {
    document.title = title;
    document.head.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  }
  if (description != null) {
    document.head.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.head.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  }
  if (image) document.head.querySelector('meta[property="og:image"]')?.setAttribute("content", image);
  if (url) {
    document.head.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  }
}
