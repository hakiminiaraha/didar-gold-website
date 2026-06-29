# Didar Gold Production Launch Runbook

## 1. Database

The app supports SQLite locally and PostgreSQL in production.

Use one of these production options:

- Render PostgreSQL: provisioned by `render.yaml`.
- Supabase PostgreSQL: set `DATABASE_URL` to the Supabase connection string and `DATABASE_SSL=true`.

Seed production content:

```bash
npm run db:seed:production
```

This seeds:

- Published collections
- Published products
- CMS route content
- Media library records for files under `public/images`, `public/videos`, and `public/icons`

## 2. CMS And Media Library

Admin-managed tables:

- `cms_content`
- `media_assets`
- `catalog_items`
- `journal_articles`
- `inquiries`

Launch images live in:

- `public/images/didar-products`
- `public/images/didar-ui`
- `public/images`

Raw Dante files remain in `local-assets` and must not be served directly.

## 3. SMS / OTP

Production SMS requires real provider credentials:

- `OTP_PROVIDER=payamsms`
- `PAYAMSMS_CLIENT_ID`
- `PAYAMSMS_CLIENT_SECRET`
- `PAYAMSMS_SYSTEM_NAME`
- `PAYAMSMS_USERNAME`
- `PAYAMSMS_PASSWORD`
- `PAYAMSMS_SENDER`

Keep demo OTP disabled:

```env
VITE_AUTH_DEMO=false
```

## 4. Render Deployment

The repository includes `render.yaml` for a Node web service plus PostgreSQL.

Deploy flow:

1. Push the repository to GitHub.
2. Open Render Blueprint:
   `https://dashboard.render.com/blueprint/new?repo=https://github.com/hakiminiaraha/didar-gold-website`
3. Fill secret env vars marked `sync: false`.
4. Apply the Blueprint.
5. Add custom domains:
   - `didargold.com`
   - `www.didargold.com`
6. Point DNS records to Render.
7. Wait for SSL certificate provisioning.

## 5. Post-Deploy QA

Run the smoke test after the first live deploy:

```bash
PRODUCTION_URL=https://didargold.com npm run audit:production
```

Then run:

```bash
npm run audit:launch
npm run lint
npm run build
npm run test:api
```

## 6. Lighthouse

Run Lighthouse only after the deployed URL is live with SSL:

- Performance target: 95+
- Accessibility target: 95+
- Best Practices target: 95+
- SEO target: 95+

Focus checks:

- Hero video poster and lazy-loaded non-hero images
- Image sizes under 300 KB where possible
- One H1 per page
- Proper alt text
- Canonical URL
- Open Graph metadata
- Robots and sitemap availability

## 7. Launch Locks

The following cannot be completed without external access:

- Supabase project credentials or Render database connection
- PayamSMS production credentials
- Render account access
- DNS provider access
- Final Lighthouse score on deployed URL

Everything else is prepared in the repository.
