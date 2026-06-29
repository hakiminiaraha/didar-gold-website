# Didar Gold Analytics Tracking Plan

## Status

The frontend now has a central tracking utility and route-level tracking manager. Tracking is disabled by default until the real marketing IDs and consent policy are approved.

## Environment Variables

```env
VITE_TRACKING_ENABLED=false
VITE_TRACKING_DEBUG=false
VITE_GA4_MEASUREMENT_ID=
VITE_GTM_CONTAINER_ID=
VITE_META_PIXEL_ID=
VITE_LINKEDIN_PARTNER_ID=
VITE_CLARITY_PROJECT_ID=
```

## Current Events

| Event | Trigger |
| --- | --- |
| `page_view` | Route change |
| `scroll_50` | First time a visitor reaches 50% scroll depth |
| `scroll_90` | First time a visitor reaches 90% scroll depth |
| `click_hero_cta` | Homepage/products hero CTA |
| `click_collection_card` | Collection card click |
| `click_product_card` | Product card/detail link click |
| `click_wishlist` | Wishlist icon click |
| `click_product_inquiry` | Product selection/inquiry intent |
| `click_reserve_appointment` | Appointment/private consultation CTA |
| `submit_lead_form` | Successful contact/appointment form submission |

## Integrations Prepared

`src/utils/tracking.js` can dispatch to:

- Google Tag Manager through `window.dataLayer`
- GA4 through `window.gtag`
- Meta Pixel through `window.fbq`
- LinkedIn Insight through `window.lintrk`
- Microsoft Clarity through `window.clarity`

## Launch Notes

- Do not enable marketing scripts before cookie/consent requirements are approved.
- Keep form payloads out of analytics. Only send non-sensitive metadata such as source, event type, product slug, and reference code.
- If server-side analytics is required, add a dedicated `/api/analytics/events` endpoint with rate limiting and bot filtering.
