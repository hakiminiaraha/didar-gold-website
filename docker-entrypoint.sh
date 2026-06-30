#!/bin/sh
set -e

# 1) Fail fast with an actionable message instead of a deep config.js throw.
#    config.js requires these to be >=32 chars in production or boot aborts.
for var in AUTH_HASH_SECRET SESSION_SECRET; do
  eval "val=\$$var"
  if [ "${#val}" -lt 32 ]; then
    echo "[entrypoint] $var is missing or <32 chars."
    echo "[entrypoint] Run: npm run docker:init   (or cp .env.docker.example .env.docker and fill secrets)"
    exit 1
  fi
done

# 2) Make the persisted uploads dir the dir the server actually serves.
#    serveFrontend() (server/http/static.js) serves static from dist/, but the
#    media handler writes uploads to public/uploads (the mounted volume). Symlink
#    so written files are reachable at /uploads/<file>: serveFrontend resolves the
#    path lexically, then fs.existsSync follows the symlink and streams the file.
#    `vite build` copies public/ into dist/, so dist/uploads exists as a real
#    (empty) dir — remove it first, else `ln` would nest the link inside it.
rm -rf dist/uploads
ln -s ../public/uploads dist/uploads
echo "[entrypoint] linked dist/uploads -> public/uploads"

# 3) Wait for Postgres. connectionTimeoutMillis makes each attempt fail fast and
#    retry, so PG's init phase (socket up, TCP not yet accepting) can't hang us.
if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] waiting for postgres..."
  until node -e "import('pg').then(({default:{Client}})=>{const c=new Client({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:false}:false,connectionTimeoutMillis:2000});return c.connect().then(()=>c.end())}).catch(()=>process.exit(1))"; do
    sleep 1
  done
  echo "[entrypoint] postgres is ready"
fi

# 4) Schema auto-applies on app boot (db.js execs schema/postgres.sql, idempotent).
#    The seed is idempotent and bootstraps the schema on import as well.
if [ "${DATABASE_SEED:-true}" != "false" ]; then
  echo "[entrypoint] seeding..."
  node server/scripts/seed-production.js || echo "[entrypoint] seed skipped/failed (continuing)"
fi

# exec so Node becomes PID 1 and receives SIGTERM directly (graceful shutdown).
exec "$@"
