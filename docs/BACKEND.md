# Backend Guide

**Stack:** Node.js 22 LTS · vanilla `node:http` (no framework) · JavaScript
(ES modules) · `node:sqlite` / PostgreSQL

This document defines how the API server is structured. We deliberately use the
built-in `node:http` module — **no Express/Fastify** — and plain JavaScript with
**no build step**. The rationale: a small app with almost no dependencies is
easy to audit, has zero framework churn, and the routing/middleware needs here
are small enough to own outright. The cost is that we maintain a thin router and
a few helpers ourselves — all in `server/http/`.

We also keep dependencies near zero on purpose: validation is hand-written
(`server/validation.js` + per-module checks) rather than a schema library, and
the only runtime dependency is `pg` (for the PostgreSQL adapter). SQLite uses
the built-in `node:sqlite`.

---

## 1. Directory layout

```
server/
├── index.js              # entrypoint: createServer + listen + graceful shutdown
├── app.js                # handleRequest: verifyOrigin → router → SPA fallback → errors
├── config.js             # env parsing + validation, exported as a typed-ish object
├── db.js                 # dual SQLite/PostgreSQL adapter, schema, audit(), transaction()
├── security.js           # hashing, tokens, cookies, timing-safe compare, mobile masking
├── validation.js         # mobile/OTP normalization + shared slug validator
├── otpProvider.js        # OTP delivery (console / generic HTTP / PayamSMS)
├── http/                 # the "framework" we own
│   ├── http-error.js     # HttpError (status + code + details)
│   ├── respond.js        # commonHeaders, sendJson
│   ├── body.js           # readJson / readBinary with size limits
│   ├── request.js        # clientIp, verifyOrigin, detectMediaType (magic bytes)
│   ├── static.js         # mimeTypes + serveFrontend (SPA serving in production)
│   └── router.js         # exact method/path matching (Map-based)
├── middleware/
│   └── auth.js           # role permissions, session lookup, requireUser/Admin/Permission
├── routes/
│   └── index.js          # registerRoutes(): one entry per endpoint
├── modules/              # business logic, one file per domain
│   ├── auth.handlers.js       # requestOtp, verifyOtp, logout, me
│   ├── wishlist.handlers.js
│   ├── admin.handlers.js      # overview, users, roles, sessions, audit, system
│   ├── cms.handlers.js        # content get/save/delete
│   ├── media.handlers.js      # list / upload
│   ├── catalog.handlers.js
│   ├── journal.handlers.js
│   └── inquiries.handlers.js
├── seeds/                # seed DATA (exported arrays, no side effects)
│   ├── catalog.seed.js
│   ├── journal.seed.js
│   └── production.seed.js
├── scripts/              # runnable maintenance tools (executed via npm scripts)
│   ├── seed-production.js          # db:seed:production
│   └── migrate-sqlite-to-postgres.js  # db:migrate:postgres
├── tests/                # node:test suites
│   ├── auth-flow.test.js
│   └── postgres-smoke.test.js
└── schema/
    └── postgres.sql      # PostgreSQL schema (SQLite schema is inline in db.js)
```

**File-naming conventions:** request handlers are `<domain>.handlers.js`, seed
data is `<name>.seed.js`, tests are `<name>.test.js`. Seeds under `seeds/` only
**export data** (consumed by `db.js` auto-seed and by `scripts/`); anything that
**runs** and mutates state lives in `scripts/`.

**Layering rule (strict, one direction):**
`index.js → app.js → routes → module handler → (middleware/auth, db, http helpers)`.
A handler owns its domain logic and serialization; shared HTTP/crypto/validation
live in `http/`, `security.js`, `validation.js`. Nothing in `http/` or
`middleware/` imports from `modules/`, `routes/`, or `app.js` — the import graph
is a DAG (verify with `grep -rn "modules\|routes" server/http/`).

We deliberately **do not** split each domain into controller/service/repo
layers — the handlers are small enough that one file per domain is the right
altitude (KISS). Promote to a service layer only when a handler grows real
branching business logic.

---

## 2. Server bootstrap

```js
// server/index.js
import http from "node:http";
import { config } from "./config.js";
import { db } from "./db.js";
import { handleRequest } from "./app.js";

const server = http.createServer(handleRequest);
server.listen(config.port, config.host, () => {
  console.log(`[didar:api] listening on http://${config.host}:${config.port}`);
});

// Graceful shutdown: stop accepting, drain, close DB, hard-cap at 10s.
function shutdown(signal) {
  server.close(async () => {
    try { await db.close(); } finally { process.exit(0); }
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { server }; // imported by the integration tests
```

The 10s hard cap can abort a legitimate in-flight upload (e.g. a 50 MB media
POST). That is intentional: a bounded shutdown beats hanging on a slow client.

---

## 3. The router we own

The router does **exact** `METHOD /path` matching. Routes have no path
parameters — all variability is in query strings — so a `Map` is all we need.

```js
// server/http/router.js
export function createRouter() {
  const routes = new Map();
  const add = (method, path, handler) => routes.set(`${method} ${path}`, handler);
  return {
    get: (p, h) => add("GET", p, h),
    post: (p, h) => add("POST", p, h),
    put: (p, h) => add("PUT", p, h),
    del: (p, h) => add("DELETE", p, h),
    match: (method, pathname) => routes.get(`${method} ${pathname}`) || null,
  };
}
```

**Known limitation (intentional):** a wrong method on a known path returns
`404 NOT_FOUND`, not `405 Method Not Allowed` + `Allow`. This matches the
original dispatch and is by design — don't "fix" it without a reason. If a
future route needs `:params`, swap the Map for a small regex matcher.

Routes are registered in one place:

```js
// server/routes/index.js (excerpt)
const r = createRouter();
r.get("/api/health", ({ response }) => sendJson(response, 200, { ok: true, service: "didar-api" }));
r.post("/api/auth/request-otp", auth.requestOtp);
r.get("/api/content", cms.getCmsContent);
r.get("/api/admin/content", (ctx) => cms.getCmsContent(ctx, true)); // admin variant via wrapper
// ...one line per endpoint...
```

---

## 4. Request context

`app.js` builds one `ctx` per request and passes it to the matched handler.
Handlers destructure what they need from it:

```js
const ctx = { request, response, url, params: {} };
// a handler:
export async function getWishlist({ request, response }) { /* ... */ }
```

`ctx` carries `request`, `response`, the parsed `url`, and `params`. It
**deliberately does not** carry an authenticated user — see §10.

```js
// server/app.js
export async function handleRequest(request, response) {
  try {
    verifyOrigin(request);
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const ctx = { request, response, url, params: {} };
    const handler = router.match(request.method, url.pathname);
    if (handler) return await handler(ctx);
    if (!url.pathname.startsWith("/api/") && serveFrontend(request, response, url)) return;
    throw new HttpError(404, "NOT_FOUND");
  } catch (error) {
    handleError(response, error); // see §9 (inlined in app.js)
  }
}
```

---

## 5. Middleware

There is no onion/`compose` chain — the needs are small. Cross-cutting behavior
is applied explicitly:

- **Origin check** runs first in `handleRequest` (`verifyOrigin`), and is a
  no-op for `GET/HEAD/OPTIONS`.
- **Security headers** are written by `commonHeaders()` on every JSON response
  (and a stricter CSP by `serveFrontend` for HTML/asset responses).
- **Auth guards** (`requireUser` / `requireAdmin` / `requirePermission`) are
  called at the top of each protected handler.

---

## 6. Body parsing (with limits)

Never read a request stream without a cap — that's a DoS vector.

```js
// server/http/body.js
const MAX = 32 * 1024;            // 32 KB default for JSON
export async function readJson(request, maxSize = MAX) { /* throws 413 over cap */ }
export async function readBinary(request, maxSize = 50 * 1024 * 1024) { /* 50 MB for media */ }
```

Handlers pass a larger cap where appropriate (e.g. CMS save uses 1 MB, journal
600 KB).

---

## 7. Validation

There is **no schema library**. Validate at the handler boundary with explicit
checks; the normalized result is what flows downstream — never trust raw input.

- `server/validation.js` holds reusable normalizers: `normalizeMobile`,
  `isValidIranianMobile`, `normalizeOtp`, and `validateSlug` (shared by catalog
  and journal; throws `INVALID_CATALOG_SLUG`).
- Domain-specific shape/limit checks live next to their handler (e.g.
  `catalogPayload` in `catalog.handlers.js`, `normalizeCmsRoute` in
  `cms.handlers.js`). Each throws an `HttpError` with a stable error code.

Rationale: hand-written checks keep the dependency surface at zero and the
validation logic readable inline. Adopt a schema lib only if validation volume
outgrows this.

---

## 8. Responses

One place owns headers and JSON serialization.

```js
// server/http/respond.js
export function commonHeaders() { /* CSP, HSTS (prod), nosniff, frame DENY, ... */ }
export function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, { ...commonHeaders(), "Content-Type": "application/json; charset=utf-8", ...extraHeaders });
  response.end(JSON.stringify(body));
}
```

---

## 9. Errors

Throw a typed `HttpError` anywhere; one handler in `app.js` maps it to a
response. Unknown errors become a generic `500` and are logged — internals are
never leaked to clients.

```js
// server/http/http-error.js
export class HttpError extends Error {
  constructor(status, code, message = code, details = null) {
    super(message);
    this.status = status; this.code = code; this.details = details;
  }
}
```

```js
// shaping (in server/app.js)
const status = error instanceof HttpError ? error.status : 500;
if (status === 500) console.error("[didar:api]", error);
sendJson(response, status, {
  error: error instanceof HttpError ? error.code : "INTERNAL_ERROR",
  message: error instanceof HttpError ? error.message : "Internal server error",
  ...(error instanceof HttpError && error.details ? { details: error.details } : {}),
});
```

---

## 10. Auth

Authentication is **OTP over SMS** with **server-side sessions** — there are no
passwords and no JWTs.

- **Request OTP** (`POST /api/auth/request-otp`): rate-limited per IP (window +
  max) and per mobile (cooldown). The code is HMAC-hashed
  (`hmac(`${challengeId}:${code}`, "otp")`) and only the hash is stored.
- **Verify OTP** (`POST /api/auth/verify-otp`): the attempt counter is
  incremented atomically (`UPDATE ... RETURNING`) so the attempt cap can't be
  raced; the code is compared with a timing-safe equal. On success a user is
  created/updated and a session is issued.
- **Sessions:** a 256-bit random token is set in an `httpOnly`, `SameSite=Lax`,
  `Secure` (production) cookie named `didar_session`; the DB stores only
  `hashSessionToken(token)`. TTL is configurable (default 30 days), renewed on
  access.
- **Guards** (`server/middleware/auth.js`): `requireUser(request)` loads the
  session user or throws `401`; `requireAdmin` / `requirePermission(perm)` add
  authorization. **The guard's return value is the single source of truth** —
  handlers use `const user = await requireUser(request)` and never read a user
  off `ctx`. We intentionally do not stash the user on `ctx`, so an authz check
  can't be bypassed by reading a stale value.
- **Roles → permissions:** `user` (none), `support` (`inquiries`), `editor`
  (`content`, `catalog`, `journal`, `media`), `admin` (all). Admins listed in
  `ADMIN_MOBILES` are (re)granted admin on login and cannot be demoted via the
  API.

---

## 11. Data layer

`server/db.js` exposes **one adapter** with a uniform interface over two
backends, chosen by `DATABASE_URL`:

- **SQLite** via the built-in `node:sqlite` (`DatabaseSync`), WAL + foreign keys
  + busy timeout. Schema is inline in `db.js`.
- **PostgreSQL** via `pg` (a pooled client). `?` placeholders are translated to
  `$1, $2, …`. Schema is `server/schema/postgres.sql`.

Both expose `get()`, `all()`, `run()`, `prepare()`, `transaction()`, `close()`.

- **Queries are always parameterized** — never string-concatenate user input.
- **`transaction(fn)`** wraps `BEGIN`/`COMMIT`/`ROLLBACK`; multi-statement
  business operations (user+session creation, wishlist replacement, CMS upsert)
  use it.
- **`audit(event)`** appends a structured row to `audit_log` (with hashed IP)
  for every significant action.

```js
// server/db.js (shape)
export async function transaction(fn) {
  // BEGIN → fn(tx) → COMMIT, or ROLLBACK on throw
}
```

---

## 12. Config

`server/config.js` parses and validates env **once** at startup and crashes
early on misconfiguration.

- `secret(name)` requires ≥32-char secrets (`AUTH_HASH_SECRET`,
  `SESSION_SECRET`) in production.
- Production refuses `OTP_PROVIDER=console`, and requires the full PayamSMS
  credential set when `OTP_PROVIDER=payamsms`.
- Exposes `port`, `host`, `trustProxy`, `appOrigins`, OTP TTL/cooldown/limits,
  session TTL, `adminMobiles`, and DB/SMS settings.

---

## 13. Security

- **Headers** (`commonHeaders` / `serveFrontend`): `Content-Security-Policy`,
  `Strict-Transport-Security` (production), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- **Origin allowlist:** `verifyOrigin` rejects state-changing requests whose
  `Origin` is neither same-origin nor in `config.appOrigins`.
- **Rate limiting:** per-IP + per-mobile on OTP; per-IP on inquiries.
- **Body caps** everywhere (see §6); set server timeouts if exposed directly.
- **Uploads:** content-type allowlist **and** magic-byte sniffing
  (`detectMediaType`) so an attacker can't smuggle SVG/HTML as an image.
- **PII:** IPs are hashed before storage; mobiles are masked in responses;
  tokens and OTP codes are never logged.

---

## 14. Logging

- Errors that become `500` are logged with `console.error("[didar:api]", err)`.
- OTP delivery and lifecycle events are recorded in `audit_log` (the durable
  trail), not via ad-hoc logs.
- No `console.log` debugging left in committed code.

> Not yet implemented: a per-request access log (method/path/status/duration).
> If added, do it as an explicit wrapper in `handleRequest`, not a global hook.

---

## 15. Testing

- **`node:test`** + `node:assert/strict` — no extra runner.
- `server/tests/auth-flow.test.js` is an **integration suite**: it imports the
  real `server` (`export { server }`), runs against in-memory SQLite
  (`DATABASE_PATH=:memory:`), and drives endpoints with `fetch()` — covering the
  OTP→session→wishlist flow, RBAC, and CRUD across all domains.
- `server/tests/postgres-smoke.test.js` exercises the PostgreSQL adapter
  (skipped without a `TEST_DATABASE_URL`).
- Run with `npm run test:api`. Add endpoint coverage to the integration suite
  when adding a route — a green suite is the contract that refactors preserve.
```
