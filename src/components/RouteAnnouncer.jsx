import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// On client-side navigation an SPA changes nothing in the document by default, so
// screen-reader users get no feedback and keyboard focus is left where it was.
// This announces the new page (via the title SeoManager just set) into a polite
// live region and moves focus to <main>, which also resets scroll to the top.
export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const liveRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    // Defer one tick so SeoManager's effect has updated document.title first.
    const id = window.setTimeout(() => {
      if (liveRef.current) liveRef.current.textContent = document.title;
      document.getElementById("main")?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />;
}
