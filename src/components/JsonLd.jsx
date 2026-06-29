import { useEffect } from "react";

// Injects a per-page JSON-LD <script> into <head> for rich results (Product,
// BlogPosting, …) and removes it on unmount/route change. Kept imperative to
// match SeoManager rather than relying on metadata hoisting.
export default function JsonLd({ id, data }) {
  useEffect(() => {
    if (!data) return undefined;
    const scriptId = `ld-${id}`;
    let el = document.getElementById(scriptId);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = scriptId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => { el?.remove(); };
  }, [id, data]);

  return null;
}
