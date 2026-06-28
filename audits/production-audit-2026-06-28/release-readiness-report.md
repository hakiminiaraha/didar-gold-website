# Didar Gold Production Readiness Report

Date: 2026-06-28

## Scope

This audit covers the current React + Vite + Tailwind frontend, local Node API/auth layer, launch assets, SEO metadata, responsive behavior, accessibility basics, and backend/CMS readiness.

## Audit Summary

- The project builds successfully for production.
- The local development site responds on `http://localhost:5173/`.
- Core routes were checked in the in-app browser at mobile width:
  - `/`
  - `/collections`
  - `/products`
  - `/services`
  - `/our-world`
  - `/art-gallery`
  - `/journal`
  - `/shop`
  - `/contact`
  - `/products/atrin-necklace`
- Checked route signals:
  - Canonical URL present.
  - One H1 on main content routes.
  - No horizontal overflow at mobile width.
  - No missing image alt attributes on checked public routes.
  - No unnamed icon buttons on checked public routes.
  - Product detail page includes Product JSON-LD.

## Changes Applied

- Added route-aware SEO manager.
- Added canonical, description, Open Graph, and Twitter metadata updates per route.
- Added Product structured data to PDP.
- Added product ownership/service trust cards to PDP.
- Fixed PDP image alt text and button accessible names.
- Fixed Art Gallery empty image alt text.
- Reduced repeated imagery across major pages and legacy sections.
- Added `sitemap.xml`, `robots.txt` sitemap reference, and `site.webmanifest`.
- Replaced the default favicon with a Didar-style SVG mark.
- Added production database schema documentation.
- Added stronger frontend security headers in the Node server:
  - HSTS in production
  - Permissions-Policy
  - Content-Security-Policy for static frontend responses

## Validation

Commands passed:

```bash
npm run lint
npm run build
npm run test:api
npm run audit:launch
```

Build result:

- Main JS gzip: about 80.83 KB
- Main CSS gzip: about 11.26 KB
- Largest used media: `/videos/hero.mp4` at 2.48 MB

API tests:

- 5 passed
- 1 PostgreSQL smoke test skipped because the external database URL is not configured locally

## Remaining Issues

- CMS content is not populated yet:
  - CMS entries: 0
  - Media assets: 0
- Product catalog is still small:
  - Products: 6
  - Collections: 3
  - Journal articles: 6
- PostgreSQL/Supabase is not connected yet in local `.env`.
- Some older source files still contain mojibake-looking Persian text in terminal output; browser rendering currently works, but a later UTF-8 cleanup pass is recommended.
- True Lighthouse scores require running against a production preview with network throttling disabled/enabled as needed.
- No real GA4/GTM/Meta/Clarity IDs are configured yet.

## Database Schema

See:

`docs/production-database-schema.md`

Recommended production stack:

- PostgreSQL
- Supabase
- Object Storage for managed media
- Row Level Security for private/customer/admin data

Primary entities:

- collections
- categories
- products
- product_images
- media_assets
- seo_metadata
- journal_articles
- leads
- appointments
- analytics_events

Existing auth/session/wishlist tables should be retained and migrated/normalized as needed.

## Production Checklist

- Configure production environment variables.
- Configure real `DATABASE_URL`.
- Configure SMS provider credentials.
- Configure admin mobile allowlist.
- Run PostgreSQL migrations on production database.
- Upload final product/media assets to storage or `/public/images`.
- Replace placeholder catalog items with final commercial catalog.
- Run production build.
- Deploy Node API + static frontend.
- Enable HTTPS and SSL.
- Configure domain DNS.
- Verify robots.txt and sitemap.xml on the live domain.
- Verify favicon, manifest, Open Graph, and canonical URLs.

## SEO Checklist

- Route metadata is now prepared.
- Product JSON-LD is prepared on PDP.
- Canonicals are route-aware.
- Sitemap exists.
- Robots references sitemap.
- Remaining:
  - Add full product schema after final catalog fields exist.
  - Add article schema for journal detail pages.
  - Add breadcrumb schema for PDP and collection detail pages.
  - Add final Persian route descriptions after UTF-8 cleanup.

## Performance Checklist

- Lazy loading is used on non-hero imagery where practical.
- Code splitting is active through lazy routes.
- Hero video remains the main heavy asset.
- Remaining:
  - Create smaller mobile hero video variant.
  - Add responsive image sets if the image library grows.
  - Add CDN caching headers in production.
  - Run Lighthouse against the deployed preview.

## Security Report

Current frontend/server posture:

- HttpOnly/SameSite session cookies exist in the API layer.
- OTP flow has validation and cooldown behavior.
- Admin endpoints reject non-admin sessions in tests.
- Static frontend responses now include stronger security headers.

Remaining backend/security requirements:

- Add rate limiting at API/reverse proxy level.
- Add CSRF strategy if cookie-authenticated unsafe mutations are expanded.
- Add strict server-side validation for all forms.
- Add audit logging for admin content changes.
- Store secrets only in environment variables.
- Enable Supabase/PostgreSQL RLS for private data.
- Keep file uploads restricted by type, size, scanning, and storage bucket policy.

## Launch Recommendation

Frontend is launch-prepared for a marketing/sales preview.

Before public commercial launch, finish:

- Real database connection
- Full product catalog
- CMS/media population
- Analytics IDs
- Production deployment and domain verification
