# et-be

**Production-grade REST API built on Express 5 and TypeScript, following Clean Architecture,
backed by PostgreSQL 16 (Prisma 7) and Redis 7.**

![Node](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-7-DC382D?logo=redis&logoColor=white)
<!-- CI badge (set once the repository exists):
![CI](https://github.com/<org>/<repo>/actions/workflows/on-pull-request.yml/badge.svg?branch=dev) -->

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [API reference](#api-reference)
4. [Architecture](#architecture)
5. [Tech stack](#tech-stack)
6. [Getting started](#getting-started)
7. [Configuration](#configuration)
8. [Scripts](#scripts)
9. [Project structure](#project-structure)
10. [Testing](#testing)
11. [CI/CD and branching](#cicd-and-branching)
12. [Deployment](#deployment)
13. [Security](#security)
14. [Contributing](#contributing)
15. [Documentation](#documentation)

## Overview

et-be is the backend of the fs-reustemp full-stack workspace. It exposes a versioned JSON API under
`/v1`, consumed by the rt-fe single-page application through a same-origin reverse proxy.

- **Clean Architecture + SOLID + pragmatic CQRS**, enforced by lint: domain and use cases never depend on
  frameworks; commands go through entities, queries through read models. Guide: [docs/architecture.md](docs/architecture.md).
- **Working boilerplate**: `GET /v1/hello` returns a greeting plus users read from Postgres (seeded by
  `npm run db:seed` through a command use case) - every layer is exercised and tested.
- **Secure by default**: helmet, strict CORS, body limits, zod validation, presenters (field whitelists),
  generic 500s; cookie sessions, CSRF and rate limiting arrive with the auth feature (ADR 0002).
- **Operable**: structured logs with request ids, liveness and readiness probes, graceful shutdown,
  non-root container, Prisma Migrate.
- **Contract-first**: every endpoint implements an OpenAPI contract; the exported spec is checked in CI.

## Features

<!-- AUTO-GENERATED:FEATURES:START -->
<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->

| Feature | Status | Since | Summary | Endpoints |
|---|---|---|---|---|
| [Hello (boilerplate demo)](docs/features/hello.md) | released | - | Hello template - POST a name (stored in Postgres, answers "hello <name>"), GET recent greetings and seeded users. | `GET /v1/hello`<br>`POST /v1/hello` |
| [Public profile](docs/features/profile.md) | in-progress | - | Read the singleton public profile in English or French. | `GET /v1/profile` |
| [Authentication](docs/features/auth.md) | planned | - | Email + password sign-in with httpOnly cookie sessions, rotating refresh tokens, reuse detection and double-submit CSRF. | `POST /v1/auth/login`<br>`POST /v1/auth/refresh`<br>`POST /v1/auth/logout`<br>`GET /v1/auth/whoami` |

<!-- AUTO-GENERATED:FEATURES:END -->

Feature pages: [docs/features/](docs/features/). Release history: [CHANGELOG.md](CHANGELOG.md).

## API reference

<!-- AUTO-GENERATED:API:START -->
<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->

| Method | Path | Summary | Auth | Operation |
|---|---|---|---|---|
| GET | `/v1/hello` | Boilerplate demo: greeting plus the most recent users read from the database | public | `showHello` |
| POST | `/v1/hello` | Boilerplate demo: store a greeting for the given name and answer "hello <name>" | public | `createHello` |
| GET | `/v1/profile` | Read the public profile and current CV | public | `getPublicProfile` |

<!-- AUTO-GENERATED:API:END -->

Interactive documentation is served at `/api-docs` (spec at `/api-docs.json`) in non-production
environments. Error responses always use `{ "error": string, "code": string, "details"?: object }`;
lists use cursor pagination `{ "items": [], "nextCursor": string | null }`.

## Latest changes

<!-- AUTO-GENERATED:CHANGES:START -->
<!-- Do not edit by hand: written by `npm run docs:readme` from docs/. -->

**Unreleased (merged into dev)**

- (001) Task 001b updates the bilingual portfolio home and design system.
_Added_
- (001) Bilingual public profile endpoint and singleton placeholder seed.
_Security_
- Security hardening: GitHub Actions pinned to commit SHAs; README table escaping fixed (CodeQL); SECURITY.md; squash merges into dev. effect 3.22.5 + minimatch 11 overrides; typecheck generates the Prisma client first (fresh clones).
_Changed_
- Hello template, write path: POST /v1/hello stores a Greeting (new greetings table, migration add_greetings) and answers "hello <name>"; GET /v1/hello also lists recent greetings.
- README: generated "Latest changes" section from this CHANGELOG.
- Self-configuring container: docker/entrypoint.sh runs `prisma migrate deploy` before the server (MIGRATE_ON_START); SEED_DEMO_DATA=true seeds the demo users at boot; `prisma` CLI moved to dependencies; production wiring shared by server and scripts (modules/productionDependencies.ts).
- src/ placeholders replaced by a working boilerplate slice: GET /v1/hello returns a greeting plus users read from Postgres (User table, init migration, `npm run db:seed` through CreateUserUseCase). Shows Clean Architecture, SOLID and pragmatic CQRS (commands/ + queries/, write and read ports and repositories) in every layer; folder-by-folder guide in docs/architecture.md.
- `npm test` runs unit + e2e without a database; `npm run test:integration` (real Postgres) also runs in CI. `db:seed-admin` replaced by `db:seed`.
_Fixed_
- Pilot task 001: lint allowed no composition-root file -> file import (server.ts -> app.ts); CI test job now applies Prisma migrations before tests; compose host ports configurable (POSTGRES_HOST_PORT / REDIS_HOST_PORT); env/errorHandler/PinoLogger headers aligned with docs/configuration.md and the installed packages.
- First real CI run (pilot project): Trivy action tag v0.36.0; Dependabot targets dev and ignores Node majors; Docker install step failed on the prepare hook (git-hooks.mjs now copied into the image).
- Lockfiles written on Windows broke npm ci on Linux CI: new `npm run lock:sync` (Linux lockfile via Docker, then npm ci); the pre-push hook checks the lockfile with the CI npm (10.9.8) on every push.
- Own .gitattributes (LF everywhere; CHANGELOG union merge) - Windows checkouts no longer rewrite every line.
- ESLint boundaries: single files classified with file descriptors (plugin 7); no-console enforced in src/; stricter ts-comment rule.
- Node engine floor 22.22.2 (dev dependencies require it).
_Added_
- Git hooks installed by npm install (commit format, no AI attribution, no secrets/.env/BOM, branch naming, CHANGELOG line, lockfile sync, up to date with dev, local pipeline before push) and a unified policy check (no file-wide lint disables, no .only/.skip tests, no BOM).
- CI: verify on every push to dev (on-dev-push.yml); policy job.
- Template baseline: Clean Architecture skeleton with documented placeholders for the auth reference slice,

<!-- AUTO-GENERATED:CHANGES:END -->

## Architecture

```mermaid
flowchart LR
  Client["rt-fe (browser)"] -->|/api/v1| Proxy["nginx / Vite proxy"]
  Proxy -->|/v1| API["et-be: interface -> use cases -> domain"]
  API --> Infra["infrastructure adapters"]
  Infra --> PG[("PostgreSQL 16")]
  Infra --> RD[("Redis 7")]
```

| Layer | Responsibility |
|---|---|
| `domain/` | Entities, invariants, ports, error catalog - no framework code |
| `use-cases/` | One class per action, single `execute()` |
| `infrastructure/` | Prisma repositories, Redis, JWT, bcrypt, pino |
| `interface/` | Routes, controllers, middlewares, zod schemas, presenters |
| `modules/` + `app.ts` + `server.ts` | Composition root and process lifecycle |

Details: [docs/architecture.md](docs/architecture.md).

## Tech stack

| Concern | Choice |
|---|---|
| Runtime / language | Node.js 22, TypeScript 5.9 (strict, CommonJS build) |
| HTTP | Express 5, helmet, cors, cookie-parser, express-rate-limit + rate-limit-redis |
| Data | PostgreSQL 16, Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`), Prisma Migrate |
| Cache / sessions | Redis 7 (ioredis) |
| Auth | jsonwebtoken, bcrypt |
| Validation | zod |
| Logging | pino, pino-http |
| API docs | OpenAPI 3 + swagger-ui-express |
| Tests | Jest, ts-jest, supertest |
| Quality | ESLint 9 (typescript-eslint, boundaries, import), Prettier |
| Delivery | Docker (multi-stage, non-root), docker compose, GitHub Actions, GHCR, Trivy, CodeQL, gitleaks |

## Getting started

**Prerequisites:** Node.js 22 (`.nvmrc`), Docker with compose.

```bash
cp .env.example .env                 # then set real secrets
npm ci                               # installs dependencies + git hooks
npx prisma generate
docker compose up -d postgres redis
npm run db:deploy                    # apply the committed migrations
npm run db:seed                      # insert demo users (idempotent)
npm run dev                          # then: curl http://localhost:4000/v1/hello
```

## Configuration

Validated at boot by `src/config/env.ts`. Main variables: `DATABASE_URL`, `REDIS_URL`,
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `COOKIE_SECURE`, `COOKIE_DOMAIN`.
Full reference and local ports: [docs/configuration.md](docs/configuration.md).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start with hot reload (nodemon + ts-node) |
| `npm run build` / `npm start` | Compile to `dist/` / run the compiled server |
| `npm run verify` | **Local pipeline** (lint, typecheck, tests, docs check) - run before every push |
| `npm run lint` / `npm run typecheck` | ESLint (zero warnings) / TypeScript |
| `npm test` (`test:unit`, `test:e2e`) / `npm run test:integration` | Jest: unit + e2e without a database / real-Postgres adapter tests |
| `npm run db:migrate` / `db:deploy` / `db:status` | Prisma Migrate (dev / deploy / status) |
| `npm run db:seed` | Insert the demo users (idempotent, refuses production) - `GET /v1/hello` reads them |
| `npm run db:provision-roles` | Least-privilege DB roles |
| `npm run docs:export` | Write `docs/openapi.json` from the OpenAPI definition |
| `npm run docs:readme` / `docs:check` | Regenerate / verify the generated README sections |

## Project structure

```
src/
  server.ts, app.ts       composition root (process, wiring)
  modules/                feature modules (one per feature) + registry
  config/                 environment loader
  domain/                 entities, ports, errors, constants
  use-cases/<feature>/    commands/ (write, via entities) and queries/ (read models)
  infrastructure/         database, repositories, security, cache, services, realtime (optional)
  interface/              controllers, routes, middlewares, validation, presenters
  docs/                   OpenAPI definition
prisma/                   schema + migrations
tests/                    unit, integration, e2e, smoke, fixtures, helpers
scripts/                  operational and documentation scripts
docs/                     architecture, configuration, feature pages, generated openapi.json
docker/                   database init scripts
```

## Testing

| Suite | Scope | Needs |
|---|---|---|
| `tests/unit` | Entities and use cases with in-memory doubles | nothing (`npm test`) |
| `tests/e2e` | HTTP routes through the real app (supertest) with in-memory adapters | nothing (`npm test`) |
| `tests/integration` | Postgres adapters (repositories) | migrated PostgreSQL (`npm run test:integration`) |

Conventions: [tests/README.md](tests/README.md).

## CI/CD and branching

- One branch per task: `feature/`, `fix/`, `refactor/`, `perf/`, `test/`, `docs/`, `chore/`, `ci/` from `dev`;
  `hotfix/` from `main`. Commits: `type(<task>): summary`.
- Push to a work branch: **verify** (lint, typecheck, tests with PostgreSQL + Redis, boundaries report,
  dependency audit, secret scan, OpenAPI drift, README docs check), then a PR into `dev` with auto-merge.
- Pull requests: verify + Docker build and Trivy scan. `main`: verify + image published to GHCR
  (`sha-<commit>`, `latest`, semver tags). Weekly CodeQL. `dev` -> `main` promotion is a manual workflow.

## Deployment

The runtime image runs `node --enable-source-maps dist/server.js` as a non-root user. Apply migrations
before starting new instances (`prisma migrate deploy`, the compose `migrate` service shows the pattern).
Probes: liveness `GET /health`, readiness `GET /ready`. Instances are stateless and scale horizontally.

## Security

Cookie-based sessions (no tokens in JavaScript), rotating refresh tokens with reuse detection, CSRF
double submit, per-concern rate limits, strict CORS allow-list, helmet, body size limits, zod validation,
presenter whitelists, parameterized SQL only, no secrets in code or logs, least-privilege database roles.
Report vulnerabilities privately to the repository owner.

## Contributing

1. Work from a task brief (`contracts/tasks/` in the workspace) on its branch.
2. Follow [docs/architecture.md](docs/architecture.md) (folders, naming, layering - lint-enforced) and copy
   the boilerplate file of the same kind.
3. Update the feature page in `docs/features/`, add a CHANGELOG line, run `npm run docs:readme`.
4. `npm run verify` must be green before pushing. No AI attribution in commits, branches or PRs.

## Documentation

| Document | Content |
|---|---|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/architecture.md](docs/architecture.md) | Layers, lifecycle, patterns, decisions |
| [docs/configuration.md](docs/configuration.md) | Environment variables, local services |
| [docs/features/](docs/features/) | One page per feature |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## License

Proprietary unless the owner adds a `LICENSE` file.
