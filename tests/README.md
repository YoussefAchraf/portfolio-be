# tests/

Mirrors the architecture (`docs/architecture.md` section 5). Jest + ts-jest (`jest.config.js`, compiled
with `tsconfig.eslint.json`). Only files named `*.test.ts` run. Never commit an empty `*.test.ts`.

| Folder | What goes here | Naming | Runs against | Command |
|---|---|---|---|---|
| `unit/` | One file per entity and per use case (command or query). Ports are in-memory doubles from `helpers/`. | `<Thing>.test.ts`, `<Verb><Thing>UseCase.test.ts` | nothing external | `npm test` |
| `e2e/` | One file per feature's routes through the REAL app (`buildTestApp()` + supertest) with in-memory adapters: status codes, envelope, validation, contract shapes. | `<feature>.routes.test.ts` | nothing external | `npm test` |
| `integration/` | One file per Postgres adapter pair (write + read repository). Real database, truncated before each test. | `Pg<Thing>Repositories.test.ts` | migrated Postgres (`DATABASE_URL`) | `npm run test:integration` |
| `smoke/` | Optional: boots the compiled server against real services (deployment checks). | `<topic>.test.ts` | running stack | - |
| `fixtures/` | Object mothers: valid domain objects with overridable fields. | `make<Thing>.ts` | - | - |
| `helpers/` | `buildTestApp`, `InMemory<Thing>Store` (implements BOTH ports of a feature), `testDoubles` (fixed clock, sequence ids, fake hasher, silent logger, switchable probe). | camelCase | - | - |

Boilerplate examples: `unit/User.test.ts`, `unit/CreateUserUseCase.test.ts`, `unit/GetHelloUseCase.test.ts`,
`e2e/hello.routes.test.ts`, `e2e/health.routes.test.ts`, `integration/PgUserRepositories.test.ts`.

## Rules

- `npm test` (= `npm run verify` and the pre-push hook) needs NO database: unit + e2e only.
- Integration tests: CI runs them against its Postgres service after `prisma migrate deploy`. Locally:
  `docker compose up -d postgres`, `npm run db:deploy`, then `npm run test:integration` (it TRUNCATES tables:
  point `DATABASE_URL` at a dev/test database, never at data you care about).
- Unit tests never touch the network, DB, Redis or the clock (inject `FixedClock`, `SequenceIds`).
- A new feature extends the in-memory store and `IRepositories` in `buildTestApp` the same way as users.
- Every bug fix ships with a regression test in the lowest layer that reproduces it.
- `any` is a lint warning here (not an error); `console` is allowed. `.only` / `.skip` are blocked by the policy check.
