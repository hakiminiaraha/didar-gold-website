# Frontend Guide

**Stack:** React 19 · Vite 8 · react-router-dom 7 (library mode, `<BrowserRouter>`) ·
**JavaScript/JSX** (no TypeScript) · Tailwind CSS 3 + CSS custom-property tokens ·
lucide-react icons.

This document describes how the frontend is **actually** structured. The app is a
**pure SPA** that talks to the separate vanilla `node:http` API (see
`docs/BACKEND.md`) over `fetch`. There is no SSR and no router data-layer: routes
are plain `element` routes and data is fetched in hooks/`useEffect`. The Vite dev
server proxies `/api` to the API on `127.0.0.1:8787`, so browser requests stay
same-origin; in production the API server also serves the built `dist/`.

---

## 1. Directory layout

```
.
├── public/                 # static assets served verbatim (images, font, videos, icons)
├── index.html              # single HTML entry (static meta, JSON-LD, font links)
├── src/
│   ├── main.jsx            # entry: createRoot + <StrictMode><App/></StrictMode>
│   ├── App.jsx             # provider tree + <BrowserRouter> + lazy <Routes>
│   ├── index.css           # @tailwind layers, @font-face, :root/[data-theme] tokens
│   ├── Pages/              # one component per route (HomePage, ProductStoryPage, AdminPage…)
│   ├── components/         # shared + section components
│   │   ├── Header.jsx, Footer.jsx, Hero.jsx, …       # presentational
│   │   ├── Admin*Manager.jsx                          # admin CMS panels
│   │   ├── RequireAuth.jsx, RequireAdmin.jsx          # route guards
│   │   └── SeoManager.jsx, TrackingManager.jsx, CmsRuntime.jsx  # head/side-effect managers
│   ├── context/           # app-wide state, split provider/context per concern
│   │   ├── AuthContext.js + AuthProvider.jsx
│   │   ├── SelectionContext.js + SelectionProvider.jsx
│   │   └── SitePreferencesContext.js + SitePreferences.jsx
│   ├── hooks/             # data hooks (useCatalog.js, useJournal.js)
│   ├── utils/             # framework-agnostic helpers (authValidation.js, tracking.js)
│   ├── data/             # static fallback content (siteContent.js, creationCatalog.js)
│   └── assets/           # build-imported assets (rare; most live in public/)
├── vite.config.js, tailwind.config.js, postcss.config.js, eslint.config.js
└── .env / .env.production  # VITE_-prefixed config only
```

**Rules**
- A route = one file in `src/Pages/`. A piece of UI used by ≥2 pages lives in
  `src/components/`; framework-agnostic logic in `src/utils/`; data hooks in
  `src/hooks/`.
- App-wide state is split into a `*Context.js` (the `createContext` + `useX`
  consumer hook) and a `*Provider.jsx` (the provider component). Keep them
  separate so fast-refresh and context identity stay stable.
- Static, non-server content (nav labels, fallback catalog) lives in `src/data/`.

---

## 2. Routing (react-router-dom 7, library mode)

Routes are declared once in `src/App.jsx` with `<BrowserRouter>` + `<Routes>`,
and **every page is `React.lazy`-loaded** behind a single `<Suspense>` with a
`PageLoader` fallback — this is the main bundle-splitting strategy (each page
becomes its own chunk).

```jsx
// src/App.jsx (shape)
const HomePage = lazy(() => import("./Pages/HomePage"));
const ProductStoryPage = lazy(() => import("./Pages/ProductStoryPage"));
// …one lazy() per page

<BrowserRouter>
  <main dir={direction} data-theme={theme} className="…">
    <SeoManager />
    <TrackingManager />
    <CmsRuntime />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:productId" element={<ProductStoryPage />} />
        <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </main>
</BrowserRouter>
```

**Conventions**
- Read route params with `useParams()`; read/write filters and tabs via
  `useSearchParams()` — never parse `location.pathname` by hand.
- Guard protected routes by wrapping the element in `<RequireAuth>` /
  `<RequireAdmin>` (`src/components/`), which read auth context and redirect to
  `/login` when unauthorized.
- Per-route `<title>`/meta are managed imperatively by `SeoManager` (see §7), not
  by rendering `<title>` in pages.

---

## 3. Data & API access

Reads happen in **custom hooks or `useEffect`** with `fetch`, guarded by an
`active` flag for cleanup. There is no global data-fetching library and no
`api-client` abstraction yet — calls hit `/api/...` directly (same-origin via the
dev proxy / prod server) with `credentials: "include"` for authenticated routes.

```js
// src/hooks/useCatalog.js — the canonical read pattern
export function useCatalog(type) {
  const [items, setItems] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`/api/catalog?type=${type}`)
      .then((r) => { if (!r.ok) throw new Error("CATALOG_UNAVAILABLE"); return r.json(); })
      .then((data) => { if (active) { setItems(data.items || []); setLoaded(true); } })
      .catch(() => { if (active) { setAvailable(false); setLoaded(true); } });
    return () => { active = false; };
  }, [type]);
  return { items, available, loaded };
}
```

**Conventions**
- Always capture an `active` (or `AbortController`) guard and clean it up so a
  late response can't `setState` on an unmounted component.
- Hooks expose `{ data, loaded, available }`-style flags; pages render a fallback
  (often from `src/data/`) when `available` is false, so the marketing site still
  renders if the API is down.
- Writes (admin panels, login, inquiries) `fetch(..., { method, credentials:
  "include", headers: { "Content-Type": "application/json" } })` and handle the
  response inline. Wrap write handlers in `try/finally` so the "saving" state is
  always cleared.

---

## 4. State management

Smallest tool first:
1. **URL** (`useSearchParams` / `useParams`) — filters, tabs, the current entity.
2. **Local** `useState` / `useReducer` — component UI state.
3. **Context** — app-wide, low-frequency concerns. Three exist, each a
   `*Context.js` + `*Provider.jsx` pair, nested in `App.jsx`:
   - **SitePreferences** — language (`fa`/`en`) + theme (`light`/`dark`); writes
     `localStorage` and sets `documentElement.lang`/`dir`/`dataset.theme`.
   - **Auth** — restores the session via `GET /api/auth/me` on mount; exposes
     `user`, `requestOtp`, `verifyOtp`, `logout`, `refreshUser`.
   - **Selection** — the wishlist/selection list, server-backed when
     authenticated, `localStorage` otherwise.

No Redux/Zustand — not needed at this size. One context per concern; never a
single mega-store. Memoize each provider's `value` with `useMemo`.

---

## 5. Styling

- **Tailwind CSS** utility classes for layout/spacing/typography. Breakpoints are
  mobile-first (`sm:`/`md:`/`lg:`/`xl:`).
- **Design tokens** are CSS custom properties on `:root`/`[data-theme='light']`
  and `[data-theme='dark']` in `src/index.css` (`--surface`, `--ink`, `--line`,
  `--contrast`, …). Reference them as `var(--…)` or via the Tailwind arbitrary
  syntax `bg-[var(--surface)]`; don't hard-code the brand hexes when a token
  exists.
- **RTL/LTR** is driven by SitePreferences: it sets `documentElement.dir`, and the
  root `<main>` mirrors it via `dir={direction}`. Write direction-aware styles
  (logical spacing, `text-start`) rather than hard left/right.
- The brand font **Doran** is declared via `@font-face` in `src/index.css` with
  `font-display: swap` and applied through `font-doran` / the base `font-family`.

---

## 6. React patterns

- Function components + hooks only. Provider `value` objects are wrapped in
  `useMemo`; expensive derived lists (e.g. catalog merges, header search) in
  `useMemo`, event handlers passed to many children in `useCallback`.
- Side effects that touch `document` (SEO, CMS overlay, tracking) live in
  dedicated manager components rendered once near the router root
  (`SeoManager`, `TrackingManager`, `CmsRuntime`) — keep that DOM work out of
  page components.
- `useEffect` data fetches must clean up (see §3). Don't fetch in render.

---

## 7. SEO, tracking & CMS managers

Three headless components mounted once in `App.jsx`:
- **`SeoManager`** — on every route change, sets `document.title`, the canonical
  link, and `description`/`og:*`/`twitter:*` meta from a per-route table. `lang`
  and `dir` are owned by SitePreferences, not here.
- **`TrackingManager`** — fires `page_view` + scroll-depth events through
  `src/utils/tracking.js`, which fans out to `window.dataLayer`/`gtag`/`fbq`/…
  **only** when `VITE_TRACKING_ENABLED === "true"` (otherwise a no-op). The
  analytics loader scripts themselves are injected by the deploy environment, not
  bundled.
- **`CmsRuntime`** — an in-place content editor/overlay. It fetches
  `/api/content` for the current route and can rewrite text/image/link nodes; the
  expensive `MutationObserver` path is intended only for editor mode / when
  overrides exist.

---

## 8. Performance

- **Route-level code-splitting** via `lazy()` on every page (§2) is the primary
  lever — keeps the initial chunk small.
- Heavy media lives in `public/`; optimize it as committed assets (subset WOFF2
  fonts, resized/WebP images, compressed video) rather than shipping originals.
  Give `<img>` intrinsic `width`/`height` (or `aspect-ratio`) to avoid CLS, plus
  `loading="lazy"` + `decoding="async"` below the fold; mark the LCP hero media
  high priority.
- Internal navigation uses react-router `<Link>` (not `<a href>`) to stay an SPA.
- Memoize measured hot paths only — React 19 reduces the need to wrap everything.

---

## 9. Config & environment

- Only `VITE_`-prefixed vars reach the client. **Never** put secrets in frontend
  env (all real secrets live on the API).
- Notable keys: `VITE_AUTH_API_URL`, `VITE_AUTH_DEMO`, `VITE_TRACKING_ENABLED` /
  `VITE_TRACKING_DEBUG`, and the analytics IDs (`VITE_GA4_MEASUREMENT_ID`,
  `VITE_GTM_CONTAINER_ID`, …). See `.env.example`.
- `.env` (dev) and `.env.production` carry non-secret config; real values come
  from the deploy environment (Render).

---

## 10. Lint & build

- **ESLint** (`eslint.config.js`) with `react-hooks` + `react-refresh` rules:
  `npm run lint`.
- **Build**: `npm run build` (Vite) → `dist/`; `npm run preview` to serve it
  locally; `npm run dev` for the dev server (with the `/api` proxy).
- There is **no component test suite yet** (the API has `node:test` tests under
  `server/`). If/when added, prefer Vitest + Testing Library and test behavior
  through the DOM. Treat this as a future addition, not an existing convention.
```

