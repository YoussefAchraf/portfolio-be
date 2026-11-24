# Configuration

Variables marked **now** are validated at boot by `src/config/env.ts` (the process exits with a readable
list of bad keys). Variables marked **auth** are reserved for the auth feature and added to `env.ts` by
that task. Local values: copy `.env.example` to `.env`. Production: inject from the platform's secret
store - never commit `.env`.

## Environment variables

| Variable | Read | Required | Default | Description |
|---|---|---|---|---|
| `NODE_ENV` | now | no | `development` | `development` | `test` | `production` |
| `PORT` | now | no | `4000` | HTTP port |
| `LOG_LEVEL` | now | no | `info` | pino level (`debug` locally) |
| `REQUEST_BODY_LIMIT` | now | no | `100kb` | Max JSON body size |
| `CORS_ORIGINS` | now | no | `http://localhost:3000` | Comma-separated exact origins allowed with credentials |
| `DATABASE_URL` | now | yes | - | PostgreSQL connection string (runtime role) |
| `DEMO_ROUTES` | now | no | on unless production | `true`/`false`: mounts the boilerplate demo `GET /v1/hello` |
| `SEED_DEMO_DATA` | now | no | `false` | `true`: insert the demo users at boot (idempotent, through `CreateUserUseCase`) |
| `MIGRATE_ON_START` | container | no | `true` | `docker/entrypoint.sh` runs `prisma migrate deploy` before the server; `false` when a separate job migrates |
| `TRUST_PROXY` | auth | no | `false` | `true` behind a reverse proxy (nginx, load balancer) |
| `COOKIE_SECURE` | auth | no | `false` | Must be `true` in production (HTTPS) |
| `COOKIE_DOMAIN` | auth | yes | - | Cookie domain |
| `REDIS_URL` | auth | yes | - | Redis connection string (with password) |
| `JWT_ACCESS_SECRET` | auth | yes | - | >= 32 characters, distinct from the refresh secret |
| `JWT_REFRESH_SECRET` | auth | yes | - | >= 32 characters |
| `JWT_ACCESS_TTL` | auth | no | `15m` | Access token lifetime (<= 15 min) |
| `JWT_REFRESH_TTL` | auth | no | `7d` | Refresh token lifetime |

Compose-only: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `PGADMIN_PASSWORD`,
`DEV_PORT`, `PGADMIN_PORT`. New variables are added to `env.ts`, `.env.example` and this table in the same change.

## Local services (docker compose)

| Service | Port | Command |
|---|---|---|
| PostgreSQL 16 | 5432 (localhost only) | `docker compose up -d postgres redis` |
| Redis 7 | 6379 (localhost only) | (same) |
| Backend (production image, migrations first) | 4000 | `docker compose up -d backend` |
| Backend dev (hot reload, `<db>_dev` database) | 4002 | `docker compose --profile dev up backend-dev` |
| pgAdmin | 5051 (localhost only) | `docker compose --profile tools up -d pgadmin` |

## First deployment (any container platform: Render, Fly, ECS, Kubernetes)

The image configures its own database on start: `docker/entrypoint.sh` applies every committed migration
(`prisma migrate deploy`, safe with several instances), then the server starts. Set only:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the managed Postgres connection string |
| `PORT` | usually injected by the platform (Render: 10000) |
| `DEMO_ROUTES` + `SEED_DEMO_DATA` | `true` to prove the deployment: `GET /v1/hello` returns the seeded users. Turn both off once real features exist |

Probes: liveness `/health`, readiness `/ready` (503 while Postgres is unreachable). Verified on 2026-11-22:
fresh Postgres 16 -> tables created, 3 users seeded, `/v1/hello` answered; restart = no-op; SIGTERM exits 0.
