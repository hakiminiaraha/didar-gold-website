import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { trackEvent } from "../utils/tracking";

export default function TrackingManager() {
  const location = useLocation();
  const scrollMarks = useRef(new Set());

  useEffect(() => {
    scrollMarks.current = new Set();
    trackEvent("page_view", { route_path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.round((window.scrollY / scrollable) * 100);
      for (const mark of [50, 90]) {
        if (progress >= mark && !scrollMarks.current.has(mark)) {
          scrollMarks.current.add(mark);
          trackEvent(`scroll_${mark}`, { scroll_depth: mark });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
