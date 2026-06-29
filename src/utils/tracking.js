const enabled = import.meta.env.VITE_TRACKING_ENABLED === "true";
const debug = import.meta.env.VITE_TRACKING_DEBUG === "true";

function cleanPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 200) : value]),
  );
}

export function trackEvent(eventName, payload = {}) {
  const event = {
    event: eventName,
    page_path: window.location.pathname,
    page_location: window.location.href,
    ...cleanPayload(payload),
  };

  if (debug) console.info("[didar:track]", eventName, event);
  if (!enabled) return;

  window.dataLayer?.push(event);
  window.gtag?.("event", eventName, event);
  window.fbq?.("trackCustom", eventName, event);
  window.lintrk?.("track", { conversion_id: eventName });
  window.clarity?.("event", eventName);
}

export function trackLink(eventName, payload = {}) {
  return () => trackEvent(eventName, payload);
}
