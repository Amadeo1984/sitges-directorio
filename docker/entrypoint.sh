#!/bin/sh
set -eu

echo "[entrypoint] Aplicando migraciones de Prisma…"
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] Arrancando Next.js (standalone)…"
exec node server.js
