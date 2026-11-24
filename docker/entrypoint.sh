#!/bin/sh
# Container entrypoint (runtime image). Makes a fresh deployment self-configuring:
#   1. apply every committed Prisma migration (creates/updates the tables) - MIGRATE_ON_START=false skips it
#   2. start the server (which seeds the demo users when SEED_DEMO_DATA=true)
# `prisma migrate deploy` only applies committed migrations, never generates or resets, and takes a
# database lock, so several instances starting together are safe. A failed migration stops the boot
# (the platform keeps the previous release running).
set -eu

if [ "${MIGRATE_ON_START:-true}" = "true" ]; then
  echo "entrypoint: applying database migrations"
  node node_modules/prisma/build/index.js migrate deploy
fi

exec node --enable-source-maps dist/server.js
