#!/bin/sh
# Runs ONCE, when the postgres volume is empty (/docker-entrypoint-initdb.d).
# Creates the "<POSTGRES_DB>_dev" database used by the backend-dev compose profile.
# To re-run it: `docker compose down -v` (WARNING: drops all local data).
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c "CREATE DATABASE \"${POSTGRES_DB}_dev\";"
