# Project Structure

A ~10k-LOC full-stack app: **React 19 + Vite + react-router 7** frontend and a
**vanilla Node.js `http`** API backend. This document covers the repository
layout, shared tooling, scripts, and conventions that tie the two halves
together. Frontend- and backend-specific conventions live in `FRONTEND.md` and
`BACKEND.md`.

---

## 1. Repository layout

A lightweight monorepo with npm workspaces. Two apps plus one shared package for
the API contract.

```
my-app/
├── package.json              # root: workspaces + cross-cutting scripts
├── package-lock.json
├── tsconfig.base.json        # shared compiler options, extended by each app
├── .editorconfig
├── .gitignore
├── .nvmrc                    # pins Node 22
├── .env.example              # documents every required env var (no secrets)
├── eslint.config.js          # flat config, shared across workspaces
├── .prettierrc
├── README.md
├── docs/
│   ├── FRONTEND.md
│   ├── BACKEND.md
│   └── PROJECT_STRUCTURE.md   # this file
│
├── packages/
│   └── shared/               # types shared by both apps (the API contract)
│       ├── package.json       # name: "@app/shared"
│       └── src/
│           ├── index.ts
│           ├── user.dto.ts
│           └── api.types.ts
│
├── frontend/                 # React 19 + Vite SPA  (see FRONTEND.md)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── .env                  # VITE_API_URL=… (dev)
│   └── src/ …
│
└── backend/                  # vanilla Node http API  (see BACKEND.md)
    ├── package.json
    ├── tsconfig.json
    ├── .env                  # DATABASE_URL, JWT_SECRET, …
    └── src/ …
```

**Why this shape**
- `packages/shared` holds DTOs and route types imported by **both** sides, so the
  frontend and backend never drift on the wire contract. Import as
  `@app/shared`.
- Each app owns its own `tsconfig.json`, lint scope, and build — but they extend
  the root `tsconfig.base.json` and share one ESLint/Prettier config.
- Workspaces give one `npm install`, hoisted deps, and simple cross-package
  references without publishing.

> If you don't want a monorepo, collapse to `frontend/` and `backend/` as
> sibling repos and duplicate the contract types — but for a single 10k-LOC
> product the shared package is worth it.

---

## 2. Root `package.json`

```json
{
  "name": "my-app",
  "private": true,
  "workspaces": ["packages/*", "frontend", "backend"],
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "npm run dev --workspace=backend & npm run dev --workspace=frontend",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc -b"
  }
}
```

- Run both dev servers with `npm run dev` (use `concurrently` instead of `&` on
  Windows).
- `tsc -b` (build mode) typechecks every workspace via project references.

---

## 3. TypeScript setup

`tsconfig.base.json` holds the strict defaults; each app extends it.

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "paths": { "@app/shared": ["./packages/shared/src/index.ts"] }
  }
}
```

- `strict` is non-negotiable. `noUncheckedIndexedAccess` catches a whole class of
  off-by-one bugs.
- Frontend `tsconfig` adds `"lib": ["DOM", "DOM.Iterable", "ES2022"]` and the
  Vite client types. Backend `tsconfig` keeps it Node-only (no DOM lib).

---

## 4. Environment & secrets

- `.env.example` at the root lists **every** variable both apps need, with dummy
  values and a comment each. It is committed; real `.env` files are git-ignored.
- Frontend: only `VITE_`-prefixed vars reach the browser. Secrets never live in
  `frontend/`.
- Backend: all secrets (`DATABASE_URL`, `JWT_SECRET`) parsed and validated at
  boot (`backend/src/config.ts`). The process crashes on missing/invalid config.
- Production values are injected by the host/CI, not from committed files.

---

## 5. The shared contract package

This is the seam that keeps the two apps honest.

```ts
// packages/shared/src/user.dto.ts
export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601
}
```

- Backend repos/controllers return objects assignable to these types; frontend
  loaders consume the same types. One change, both sides updated, `tsc` catches
  mismatches.
- Keep this package **type-only** where possible (no runtime deps) so it adds
  nothing to either bundle. If you share runtime validators (zod schemas), they
  can live here too and both sides import them.

---

## 6. Naming conventions

| Thing                  | Convention            | Example                     |
|------------------------|-----------------------|-----------------------------|
| Directories            | `kebab-case`          | `user-detail/`              |
| React components        | `PascalCase` export   | `UserList.tsx`              |
| Route modules           | `*.route.tsx`         | `users.route.tsx`           |
| Hooks                   | `use-*.ts` / `useX`   | `use-auth.ts`               |
| Backend modules         | `*.controller.ts` etc | `users.service.ts`          |
| Test files              | `*.test.ts(x)`        | `users.service.test.ts`     |
| Types/interfaces        | `PascalCase`          | `UserDto`                   |
| Env vars                | `SCREAMING_SNAKE`     | `DATABASE_URL`              |

- Co-locate tests and styles next to the unit they cover.
- One default-exported component per file on the frontend; named exports for
  everything else.

---

## 7. Tooling

- **Package manager:** npm workspaces (one lockfile at the root).
- **Lint:** one flat ESLint config at the root, scoped per workspace via
  `files` globs (React rules for `frontend/`, Node rules for `backend/`).
- **Format:** Prettier, single config, run on the whole tree.
- **Typecheck:** `tsc -b` across project references.
- **Git hooks:** lint-staged + a pre-commit hook running `lint` + `typecheck` on
  changed files.

---

## 8. Scripts cheat sheet

| Command                 | Effect                                          |
|-------------------------|-------------------------------------------------|
| `npm install`           | Install all workspaces                          |
| `npm run dev`           | Start backend + frontend dev servers            |
| `npm run build`         | Build every workspace                           |
| `npm test`              | Run all test suites                             |
| `npm run lint`          | Lint the whole repo                             |
| `npm run typecheck`     | Typecheck all projects                          |
| `npm run dev -w frontend` | Run only the frontend                         |

---

## 9. Git & CI conventions

- **Branches:** `main` (protected) + short-lived `feature/*`, `fix/*` branches.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`…) — enables
  automated changelogs.
- **CI pipeline** on every PR: install → `typecheck` → `lint` → `test` →
  `build`. All four must pass to merge.
- **`.gitignore`** covers `node_modules/`, `dist/`, `.env`, coverage output, and
  editor cruft.

---

## 10. Build & deploy outline

- **Frontend:** `vite build` → static assets in `frontend/dist/`. Serve from a
  CDN/static host. `VITE_API_URL` points at the deployed API.
- **Backend:** compile TS → `backend/dist/`, run `node dist/server.js` behind a
  process manager / container. Set `NODE_ENV=production` and all secrets in the
  environment.
- **CORS:** the API's `CORS_ORIGIN` must equal the frontend's deployed origin.
- Run DB migrations as a release step before the new server version starts
  accepting traffic.
