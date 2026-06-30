# ---------- Stage 1: build the frontend ----------
FROM node:22-slim AS builder
WORKDIR /app
# Build tools for native devDeps (sharp / ttf2woff2 / esbuild postinstall etc.).
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# VITE_* are compile-time; baked into the bundle by `vite build`.
# Pass via --build-arg (compose: build.args), NOT runtime env.
ARG VITE_AUTH_API_URL=/api/auth
ARG VITE_AUTH_DEMO=false
ARG VITE_TRACKING_ENABLED=false
ARG VITE_GA4_MEASUREMENT_ID=
ARG VITE_GTM_ID=
ARG VITE_META_PIXEL_ID=
ARG VITE_LINKEDIN_PARTNER_ID=
ARG VITE_CLARITY_PROJECT_ID=
RUN npm run build      # -> /app/dist

# ---------- Stage 2: production runtime ----------
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Only production deps. Frontend libs are bundled into dist; the server runtime
# effectively only needs `pg` (node:sqlite is built in). No native toolchain.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# App code + built assets + seed source assets (seed reads media from public/).
COPY server ./server
COPY public ./public
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh \
 && mkdir -p server/data public/uploads \
 && chown -R node:node /app
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=4s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server/index.js"]
