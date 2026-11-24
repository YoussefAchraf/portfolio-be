# Changelog

All notable changes to et-be. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

- Every task adds a line under **Unreleased** (Added / Changed / Fixed / Removed / Security), with its task id.
- The release task (when `dev` is promoted to `main`) renames **Unreleased** to the new version and date,
  sets `since:` on the released feature pages, and runs `npm run docs:readme`.

## [Unreleased]

### Security
- Security hardening: GitHub Actions pinned to commit SHAs; README table escaping fixed (CodeQL); SECURITY.md; squash merges into dev. effect 3.22.5 + minimatch 11 overrides; typecheck generates the Prisma client first (fresh clones).

### Changed
- Hello template, write path: POST /v1/hello stores a Greeting (new greetings table, migration add_greetings) and answers "hello <name>"; GET /v1/hello also lists recent greetings.
- README: generated "Latest changes" section from this CHANGELOG.
- Self-configuring container: docker/entrypoint.sh runs `prisma migrate deploy` before the server (MIGRATE_ON_START); SEED_DEMO_DATA=true seeds the demo users at boot; `prisma` CLI moved to dependencies; production wiring shared by server and scripts (modules/productionDependencies.ts).
- src/ placeholders replaced by a working boilerplate slice: GET /v1/hello returns a greeting plus users read from Postgres (User table, init migration, `npm run db:seed` through CreateUserUseCase). Shows Clean Architecture, SOLID and pragmatic CQRS (commands/ + queries/, write and read ports and repositories) in every layer; folder-by-folder guide in docs/architecture.md.
- `npm test` runs unit + e2e without a database; `npm run test:integration` (real Postgres) also runs in CI. `db:seed-admin` replaced by `db:seed`.

### Fixed
- Pilot task 001: lint allowed no composition-root file -> file import (server.ts -> app.ts); CI test job now applies Prisma migrations before tests; compose host ports configurable (POSTGRES_HOST_PORT / REDIS_HOST_PORT); env/errorHandler/PinoLogger headers aligned with docs/configuration.md and the installed packages.
- First real CI run (pilot project): Trivy action tag v0.36.0; Dependabot targets dev and ignores Node majors; Docker install step failed on the prepare hook (git-hooks.mjs now copied into the image).
- Lockfiles written on Windows broke npm ci on Linux CI: new `npm run lock:sync` (Linux lockfile via Docker, then npm ci); the pre-push hook checks the lockfile with the CI npm (10.9.8) on every push.
- Own .gitattributes (LF everywhere; CHANGELOG union merge) - Windows checkouts no longer rewrite every line.
- ESLint boundaries: single files classified with file descriptors (plugin 7); no-console enforced in src/; stricter ts-comment rule.
- Node engine floor 22.22.2 (dev dependencies require it).

### Added
- Git hooks installed by npm install (commit format, no AI attribution, no secrets/.env/BOM, branch naming, CHANGELOG line, lockfile sync, up to date with dev, local pipeline before push) and a unified policy check (no file-wide lint disables, no .only/.skip tests, no BOM).
- CI: verify on every push to dev (on-dev-push.yml); policy job.
- Template baseline: Clean Architecture skeleton with documented placeholders for the auth reference slice,
  Prisma 7 + PostgreSQL 16, Redis 7, Docker multi-stage image, CI (verify, CodeQL, Docker build + Trivy),
  generated README sections from `docs/`.
