# scripts/

One-off operational TypeScript scripts, run with ts-node through npm scripts. `console` is
allowed here; scripts are never imported by `src/`, but they MAY import from `src/` (config
loader, adapters) to reuse the real wiring. No tests required, but every script must be
idempotent (safe to run twice).

| Script | npm command | Status | What it does |
|---|---|---|---|
| `exportSwagger.ts` | `npm run docs:export` | implemented | Writes `src/docs/swaggerDefinition.ts` -> `docs/openapi.json` (CI "openapi drift" job compares it). |
| `seedDemoUsers.ts` | `npm run db:seed` | implemented | Inserts demo users through `CreateUserUseCase` (a script is a composition root); idempotent; refuses `NODE_ENV=production`. |
| `provisionDbRoles.ts` | `npm run db:provision-roles` | placeholder | Creates least-privilege Postgres roles: `app_runtime` (DML only) and `app_migrator` (DDL). |

Each file's header comment states its role and rules. A script never writes business data with raw SQL or Prisma: it calls a use case.
