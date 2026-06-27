# Didar Gold digital experience

React + Vite frontend with a Node.js API for OTP authentication, secure cookie sessions, server-side wishlists, and the admin foundation.

## Requirements

- Node.js 26 or newer (`node:sqlite` is used without an external database package)
- npm 11 or newer

## Local development

Create `.env` from `.env.example`, then run the API and frontend in separate terminals:

```powershell
npm run dev:api
```

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- API health: `http://127.0.0.1:8787/api/health`
- Development OTP with `OTP_PROVIDER=console`: `123456`

### PayamSMS OTP provider

The production SMS adapter follows Atieh Dadeh Pardaz PayamSMS REST v2.1. Set `OTP_PROVIDER=payamsms` and provide the `PAYAMSMS_*` variables documented in `.env.example`. The adapter obtains an OAuth2 token, caches it only in memory until shortly before expiry, converts Iranian mobile numbers to `98...`, and sends through `/panel/webservice/send`. A response is accepted only when it contains `serverId`; provider `errorCode` values are treated as delivery failures.

The v2.1 document references `refresh_token` for renewal but does not include it in the documented login response. The adapter therefore performs a fresh OAuth login after token expiry instead of depending on an undocumented refresh value.

The Vite server proxies `/api` to port `8787`, so browser requests remain same-origin.

## Checks

```powershell
npm run lint
npm run build
npm run test:api
```

The PostgreSQL smoke test is skipped unless `TEST_DATABASE_URL` points to a disposable PostgreSQL database.

## Authentication API

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/wishlist`
- `PUT /api/wishlist`
- `GET /api/admin/overview` (admin role required)
- `PUT /api/admin/users/role` (admin role required)
- `GET|DELETE /api/admin/sessions` (admin role required)

Admin access is split into four roles: `user` has no panel access, `support` manages inquiries, `editor` manages content, catalog, journal, and media, and `admin` also manages users, roles, sessions, audit data, and system status. Changing a staff role revokes that user's existing sessions so the new permissions apply immediately. Owner accounts listed in `ADMIN_MOBILES` cannot be demoted from the panel.

See [docs/auth-api-contract.md](docs/auth-api-contract.md) for the request contract and production security requirements.

## Content management

Authorized administrators can manage rendered content for every public route from `/admin`:

- choose a page and Persian/English locale;
- click text, images, links, or video elements in the live preview;
- edit and publish without changing source files;
- upload JPG, PNG, WebP, GIF, MP4, and WebM assets;
- keep published overrides in SQLite while source content remains the fallback.

CMS API routes:

- `GET /api/content?route=/&locale=fa`
- `GET|PUT|DELETE /api/admin/content` (editor or admin)
- `GET|POST /api/admin/media` (editor or admin)

Structured catalog API routes:

- `GET /api/catalog?type=product|collection` (published items only)
- `GET /api/catalog?type=product|collection&slug=...`
- `GET|POST|PUT|DELETE /api/admin/catalog` (editor or admin)

The admin catalog supports drafts, publishing, ordering, bilingual product and collection data, galleries, specifications, trust-service flags, and media uploads. Products and collections are consumed by the home page, catalog, shop, and detail routes with local source data as an offline fallback.

Structured journal API routes:

- `GET /api/journal` and `GET /api/journal?slug=...` (published articles only)
- `GET|POST|PUT|DELETE /api/admin/journal` (editor or admin)

Journal administration supports drafts, publishing, featured stories, ordering, categories, bilingual article sections, reading time, and featured image uploads. Published stories feed the home page, journal index, and article detail route.

Inquiry and consultation API routes:

- `POST /api/inquiries` (public, rate limited, returns a tracking code)
- `GET /api/admin/inquiries` (support or admin)
- `PUT /api/admin/inquiries` (support or admin)

The admin inbox supports search, status filters, private contact details, internal notes, and the `new`, `contacted`, `scheduled`, and `closed` workflow. Public responses never echo submitted contact details.

Uploaded assets are stored in `public/uploads/`. Production should mount this directory on persistent storage or replace it with object storage.

## Production notes

- `OTP_PROVIDER=console` is rejected in production.
- Set independent high-entropy `AUTH_HASH_SECRET` and `SESSION_SECRET` values.
- Configure HTTPS and keep authentication on secure `HttpOnly` cookies.
- Set `ADMIN_MOBILES` only through protected deployment configuration.
- Choose and configure the SMS vendor before production deployment.
- SQLite remains the default for local development. Setting `DATABASE_URL` switches the same API to PostgreSQL; set `DATABASE_SSL=true` when required by the host.

## PostgreSQL cutover

1. Provision an empty PostgreSQL database and back up `server/data/didar.sqlite`.
2. Set `DATABASE_URL`, `DATABASE_SSL`, and keep `DATABASE_PATH` pointed at the source SQLite file.
3. Run `npm run db:migrate:postgres`. The command refuses to write to a non-empty destination, preserves IDs, verifies row counts, and resets PostgreSQL sequences.
4. Start the API with `DATABASE_URL` configured and run `npm run test:api` plus the production smoke checks.

OTP challenges and active sessions are intentionally not copied during cutover, so users sign in again. Set `MIGRATE_AUTH_STATE=true` only when preserving those short-lived records is explicitly required and the same authentication secrets remain in use.
