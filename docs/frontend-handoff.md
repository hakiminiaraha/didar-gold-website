# Frontend handoff

## Completed

- Responsive Persian/English interface with RTL/LTR support.
- Light and dark themes.
- Public sitemap routes, collection and product stories, journal articles, contact, wishlist, selection list, and account access.
- Mobile navigation, site search, real footer destinations, and a not-found route.
- Route-level code splitting, zero dead `#` links, and zero actionless buttons.
- Auth-gated wishlist with a production API adapter and local development demo mode.

## External approvals required before production

- Confirm the production domain before adding canonical URLs and the final XML sitemap.
- Supply legally approved privacy policy, terms of use, and mobile/OTP consent copy.
- Confirm the official telephone number, physical address, email, and social profile URLs.
- Replace illustrative product IDs, specifications, availability, service coverage, and editorial copy with approved source data.
- Choose the OTP/SMS provider and implement the server contract in `docs/auth-api-contract.md`.
- Decide analytics and cookie-consent requirements with the legal and marketing teams.

These are business, legal, and backend dependencies. The frontend should not invent them.
