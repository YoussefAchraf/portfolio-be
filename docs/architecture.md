# et-be architecture guide

The definitive map of `src/`: what each folder and subfolder contains, which file types and names it
uses, what it may import, and what it must never contain. Every rule points at a real file of the
**boilerplate slice** (the working `GET /v1/hello` feature), so the shape can be read in code, not
just in prose. Lint enforces the import and naming rules; this guide explains them.

> Contributors (human or AI): read this guide once per project, then work from the boilerplate files. When you add a
> feature, open the boilerplate file of the same kind and copy its shape (section 6).

## 1. Principles (and where you can see them)

### Clean Architecture - the dependency rule

Source code dependencies point **inward only**. Business rules know nothing about Express, Prisma,
Postgres, bcrypt or pino; those are details plugged in at the edge.

```
            +---------------------------------------------------------------+
            |  composition root: server.ts, app.ts, modules/, scripts/      |  knows everything,
            |  (chooses implementations, wires them, owns the process)       |  contains no rules
            +---------------------------------------------------------------+
                 |                    |                         |
        +----------------+   +------------------+   +----------------------+
        | interface/     |   | infrastructure/  |   | config/ , docs/       |
        | HTTP delivery  |   | adapters (DB,    |   | env, OpenAPI          |
        +----------------+   | crypto, logging) |   +----------------------+
                 |           +------------------+
                 v                    |
        +----------------+            |  implements
        | use-cases/     |            |
        | app logic      |            v
        +----------------+   +------------------+
                 |---------> | domain/          |  entities, ports, errors, constants
                             | (the center)     |  imports NOTHING outside domain/
                             +------------------+
```

| Rule | Enforced by | See |
|---|---|---|
| `domain/` imports only `domain/` | eslint-plugin-boundaries | `src/domain/entities/User.ts` |
| `use-cases/` imports only `domain/` (+ other use cases' types) | boundaries | `src/use-cases/users/commands/CreateUserUseCase.ts` |
| `infrastructure/` imports `domain/` + the generated Prisma client | boundaries | `src/infrastructure/repositories/PgUserRepository.ts` |
| `interface/` imports `domain/` + `use-cases/` | boundaries | `src/interface/controllers/HelloController.ts` |
| only `config/env.ts` reads `process.env` | `no-restricted-properties` | `src/config/env.ts` |
| Express only in `interface/` + composition root; Prisma only in `infrastructure/` | `no-restricted-imports` | per-folder blocks in `eslint.config.mjs` |

### SOLID - concretely

| Principle | What it means here | Boilerplate example |
|---|---|---|
| **S** Single responsibility | One use case = one business action; one controller method = one HTTP adapter call; one presenter = one response shape | `GetHelloUseCase` answers one question; `HelloController.show` only reads input, calls it, presents |
| **O** Open/closed | Add features by adding files (a module + one registry line), not by editing `app.ts` | `src/modules/index.ts` -> `featureModules()` |
| **L** Liskov substitution | Any implementation of a port works unchanged: Postgres in production, in-memory in tests | `PgUserRepository` vs `tests/helpers/inMemoryUserStore.ts` behind `IUserRepository` |
| **I** Interface segregation | Small ports shaped by their consumer: the write port and the read port are separate | `IUserRepository` (commands) vs `IUserReadRepository` (queries) |
| **D** Dependency inversion | Use cases depend on ports the domain owns; adapters implement them; only the composition root picks concrete classes | `CreateUserUseCase` receives `IPasswordHasher`; `server.ts` passes `BcryptPasswordHasher` |

### CQRS - pragmatic, single database

| | Command (write) | Query (read) |
|---|---|---|
| Purpose | change state | answer a question, never change state |
| Folder | `use-cases/<feature>/commands/` | `use-cases/<feature>/queries/` |
| Goes through | the **entity** (invariants run) | a **read model** (plain readonly DTO) |
| Port | `I<Thing>Repository` (entities in/out) | `I<Thing>ReadRepository` (read models out) |
| Adapter | `Pg<Thing>Repository` (maps row <-> entity) | `Pg<Thing>ReadRepository` (selects only needed columns) |
| Returns | an id / small result | the view the screen needs |
| Example | `CreateUserUseCase` (used by `scripts/seedDemoUsers.ts`) | `GetHelloUseCase` (used by `GET /v1/hello`) |

One Postgres database serves both sides. A separate read store, event sourcing or a message bus is an
architecture decision (ADR via the manager), never a default.

## 2. Folder by folder

Legend: **Contains** = what belongs there; **Files** = file kinds and naming; **May import** = allowed
dependencies; **Never** = what is forbidden there.

### `src/server.ts` - composition root (PROCESS)
- **Contains:** the entry point: `loadConfig()` -> `createProductionDependencies()` -> optional demo seed ->
  `buildApp()` -> `listen` -> graceful shutdown on SIGTERM/SIGINT. Migrations run before it, in the container
  entrypoint (`docker/entrypoint.sh`).
- **Never:** business rules, routes, middleware definitions. It is the only place that chooses
  production implementations.

### `src/app.ts` - composition root (WIRING)
- **Contains:** `buildApp(deps, options)`: global middleware in a fixed order, `/health` + `/ready`, every
  feature module under `/v1`, then 404 and the error handler.
- **Never:** `process.env`, `listen`, database connection. Must not change when a feature is added.
- Tests build the same app with in-memory dependencies (`tests/helpers/buildTestApp.ts`).

### `src/modules/` - composition root (FEATURE WIRING)
| File | Contains |
|---|---|
| `types.ts` | `ISharedDependencies` (all adapters, typed as ports), `IRepositories`, `IFeatureModule`, `FeatureModuleFactory` |
| `index.ts` | `featureModules()` - the registry, one line per feature, optional features switched by config |
| `productionDependencies.ts` | `createProductionDependencies(config)` - THE choice of production adapters, shared by `server.ts` and scripts |
| `demoData.ts` | demo rows inserted through `CreateUserUseCase` (boot with `SEED_DEMO_DATA=true`, or `npm run db:seed`) |
| `<feature>Module.ts` | `create<Feature>Module`: ports -> use cases -> controller -> routes, returns `{ name, basePath, router }` |
| `healthModule.ts` | builds the root `/health` + `/ready` router from the probes |

- **May import:** everything. **Never:** logic. A module only calls constructors.

### `src/config/` - configuration
- **Contains:** `env.ts` only: a zod schema for every environment variable, `loadConfig()` returning a
  frozen typed `IAppConfig`, fail-fast error listing bad keys (never their values).
- **Never:** reading `process.env` anywhere else (lint). Every variable is also in `.env.example` and
  `docs/configuration.md`.

### `src/domain/` - the business core (no frameworks, no I/O)
| Subfolder | Contains | Files / naming | Boilerplate |
|---|---|---|---|
| `entities/` | Aggregates: data + invariants + state-changing methods. Private constructor, `create()` (validates new data) and `fromPersistence()` (trusted rows), getters, `toProps()` | `<Thing>.ts` -> `class <Thing>` + `I<Thing>Props`, `ICreate<Thing>Input` | `User.ts` |
| `interfaces/` | **Ports**: what use cases need from the outside world. Write ports speak entities; read ports speak read models | `I<Thing>Repository.ts`, `I<Thing>ReadRepository.ts` (+ `I<Thing>ListItem`), `I<Capability>.ts` (`IClock`, `IIdGenerator`, `IPasswordHasher`, `ILogger`, `IReadinessProbe`) | all files there |
| `errors/` | `AppError` (code + message + status + details) and `ERROR_CODES` (the public catalog from `contracts/conventions.md`) | `AppError.ts`, `errorCodes.ts` | both |
| `constants/` | Closed value sets as `as const` arrays + derived types | `<topic>.ts` (`roles.ts`) | `roles.ts` |
| `validation/` | Pure, reusable business checks shared by several entities (e.g. a slug rule) - only on the second need | `<rule>.ts` | empty (`.gitkeep`) |
| `utils/` | Pure helpers with no business meaning (e.g. money rounding) | `<helper>.ts` | empty (`.gitkeep`) |

- **May import:** `domain/` only. **Never:** Express, Prisma, Redis, `process.env`, `console`, `new Date()`
  or `Math.random()` (time and ids are passed in), HTTP status logic outside `AppError`.

### `src/use-cases/` - application logic
- **Layout:** `use-cases/<feature>/commands/<Verb><Thing>UseCase.ts` and
  `use-cases/<feature>/queries/<Verb><Thing>UseCase.ts`.
- **Contains:** one class per action with constructor-injected **ports** and a single public
  `execute(input)` (lint). Input/output types (`I<Verb><Thing>Command`, `I<Verb><Thing>Query`,
  `I<Thing>View`, `I<Verb><Thing>Result`) live in the same file.
- **Commands:** check rules that need I/O (uniqueness, existence), build/modify the entity, persist via
  the write port, log a domain event name, return an id or small result.
- **Queries:** call the read port, shape the view, clamp sizes. Never call `save()`.
- **May import:** `domain/` (and types of other use cases). **Never:** Express (`req`, `res`, status
  codes), Prisma, response JSON shaping (presenters), `process.env`.
- **Boilerplate:** `users/commands/CreateUserUseCase.ts`, `hello/queries/GetHelloUseCase.ts`.

### `src/infrastructure/` - adapters (implement domain ports)
| Subfolder | Contains | Files / naming | Boilerplate |
|---|---|---|---|
| `database/` | The single DB client of the process + its readiness probe + disconnect | `prismaClient.ts` (`createDatabase(url)`), later `PrismaUnitOfWork.ts` for multi-aggregate transactions | `prismaClient.ts` |
| `repositories/` | Write adapters (`mapRow`: row -> entity, `toProps()` -> row; DB errors that are business facts -> `AppError`) and read adapters (select only the read-model columns, bounded, indexed order) | `Pg<Thing>Repository.ts`, `Pg<Thing>ReadRepository.ts` - every class here must be `Pg...Repository` (lint) | `PgUserRepository.ts`, `PgUserReadRepository.ts` |
| `security/` | Crypto adapters: hashing, tokens, CSRF | `<Algorithm><Capability>.ts` (`BcryptPasswordHasher`) or `<Thing>Service.ts` | `BcryptPasswordHasher.ts` |
| `services/` | Other technical adapters: logger, clock, id generator, email, storage | named adapter (`PinoLogger`, `SystemClock`, `CryptoIdGenerator`) or `<Thing>Service.ts` | three files |
| `cache/` | Redis client wrapper (add with the first feature that needs Redis) | `RedisClient.ts` | - |
| `realtime/` | Optional Socket.IO module (see its `.gitkeep`) | - | - |

- **May import:** `domain/`, the generated Prisma client (`src/generated/`), the library it adapts.
- **Never:** Express, `process.env` (receive values by constructor), business decisions (an adapter
  translates, it does not decide), returning Prisma rows to callers.

### `src/interface/` - HTTP delivery
| Subfolder | Contains | Files / naming | Boilerplate |
|---|---|---|---|
| `routes/` | URL map per feature: path + middleware chain + controller method | `<feature>Routes.ts` -> `export function <feature>Routes(deps): Router` (lint) | `helloRoutes.ts`, `healthRoutes.ts` |
| `controllers/` | Thin classes: read validated input -> call ONE use case -> presenter -> status + JSON | `<Thing>Controller.ts`, methods `list/show/create/update/remove` or action verbs, never `getX/postX` (lint) | `HelloController.ts`, `HealthController.ts` |
| `middlewares/` | Cross-cutting HTTP concerns as factories | `<thing>Middleware.ts` exporting a factory (`validate(...)`, `errorHandlerMiddleware(...)`) | validate, errorHandler, notFound, requestLogger |
| `validation/` | zod schemas for body / params / query, with inferred types | `<feature>Schemas.ts` -> `<action><Part>Schema` + type | `helloSchemas.ts` |
| `presenters/` | Whitelist of public fields; entity/read model -> contract JSON (ISO dates) | `<Thing>Presenter.ts` -> `present<Thing>()` + `I<Thing>Response` | `UserPresenter.ts`, `HelloPresenter.ts` |

- **May import:** `domain/`, `use-cases/`, Express, zod. **Never:** Prisma/Redis, business rules,
  `res.json(entity)`, reading raw `req.body`/`req.query` in controllers (use `validatedInput(res, part)`).

### `src/docs/` - OpenAPI
- **Contains:** `swaggerDefinition.ts` (document + shared components) and one `<feature>Docs.ts`
  fragment per feature (`<feature>Paths`, `<feature>Schemas`). `npm run docs:export` writes
  `docs/openapi.json`; CI fails when it is stale. Shapes come from `contracts/openapi/<feature>.yaml`.
- **May import:** `docs/`, `domain/`. **Boilerplate:** `helloDocs.ts`.

### `src/generated/` - Prisma client (generated, gitignored)
- Output of `npx prisma generate`. Never edited, imported only by `infrastructure/`.

### Outside `src/`
| Path | Contains |
|---|---|
| `prisma/schema.prisma` | The database structure (models, enums, indexes, `@@map` snake_case). Source of truth for tables |
| `prisma/migrations/` | Generated SQL migrations, committed with the schema change (`npm run db:migrate -- --name <change>`) |
| `scripts/` | Ops scripts = small composition roots that call use cases (`seedDemoUsers.ts`), never raw SQL for business data |
| `tests/unit/` | One file per entity / use case, in-memory doubles, no I/O |
| `tests/e2e/` | The real app via `buildTestApp()` + supertest with in-memory adapters (no database) |
| `tests/integration/` | Real Postgres adapters (`npm run test:integration`, needs a migrated `DATABASE_URL`) |
| `tests/helpers/`, `tests/fixtures/` | In-memory ports, deterministic doubles, object mothers |

## 3. The read path, step by step (`GET /v1/hello?limit=5`)

| # | File | What happens |
|---|---|---|
| 1 | `app.ts` | requestLogger -> helmet -> cors -> json -> `/v1/hello` router |
| 2 | `interface/routes/helloRoutes.ts` | `validate({ query: showHelloQuerySchema })` then `controller.show` |
| 3 | `interface/middlewares/validateRequestMiddleware.ts` | zod coerces `limit` to a number, default 10, max 50; invalid -> 422 `VALIDATION_FAILED` |
| 4 | `interface/controllers/HelloController.ts` | `validatedInput(res, 'query')` -> `getHello.execute({ limit })` |
| 5 | `use-cases/hello/queries/GetHelloUseCase.ts` | clamps the limit, calls `IUserReadRepository.listRecent(limit)` |
| 6 | `infrastructure/repositories/PgUserReadRepository.ts` | one indexed, bounded `SELECT` of the read-model columns |
| 7 | `interface/presenters/HelloPresenter.ts` + `UserPresenter.ts` | whitelist + ISO dates -> `{ message, users }` |
| 8 | `errorHandlerMiddleware.ts` (only on failure) | `AppError` -> its envelope; anything else -> logged + generic 500 |

## 4. The write path, step by step (`npm run db:seed`)

| # | File | What happens |
|---|---|---|
| 1 | `scripts/seedDemoUsers.ts` | composition root: config, database, `PgUserRepository`, bcrypt, clock, ids |
| 2 | `use-cases/users/commands/CreateUserUseCase.ts` | unique email check via the write port -> CONFLICT if taken |
| 3 | `domain/entities/User.ts` | `User.create()` normalizes + validates (VALIDATION_FAILED with field keys) |
| 4 | `infrastructure/repositories/PgUserRepository.ts` | `upsert` of `toProps()`; unique violation P2002 -> `AppError` CONFLICT |

## 5. Tests mirror the layers

| Layer under test | Test kind | Doubles | Boilerplate |
|---|---|---|---|
| entity | unit | none | `tests/unit/User.test.ts` |
| command / query use case | unit | `InMemoryUserStore`, `FixedClock`, `SequenceIds`, `fakeHasher` | `CreateUserUseCase.test.ts`, `GetHelloUseCase.test.ts` |
| HTTP (routes, validation, presenters, errors) | e2e | `buildTestApp()` (real app, in-memory ports) | `tests/e2e/*.routes.test.ts` |
| Postgres adapters | integration | real database | `tests/integration/PgUserRepositories.test.ts` |

`npm test` (and therefore `npm run verify` and the pre-push hook) runs unit + e2e and needs no
database. CI also runs `npm run test:integration` against its Postgres service after `prisma migrate deploy`.

## 6. Adding a feature by copying the boilerplate

For a feature `projects` with a command `CreateProject` and a query `ListProjects`:

| Step | Create (copy from) |
|---|---|
| 1 Contract | `contracts/openapi/projects.yaml` must exist (manager) |
| 2 Table | model `Project` in `prisma/schema.prisma` -> `npm run db:migrate -- --name add-projects` (copy `User`) |
| 3 Entity | `domain/entities/Project.ts` (copy `User.ts`: private ctor, `create`, `fromPersistence`, getters, `toProps`) |
| 4 Ports | `domain/interfaces/IProjectRepository.ts` (copy `IUserRepository`) + `IProjectReadRepository.ts` (copy `IUserReadRepository`) |
| 5 Adapters | `infrastructure/repositories/PgProjectRepository.ts` + `PgProjectReadRepository.ts` (copy the Pg user pair) |
| 6 Use cases | `use-cases/projects/commands/CreateProjectUseCase.ts` (copy `CreateUserUseCase`), `use-cases/projects/queries/ListProjectsUseCase.ts` (copy `GetHelloUseCase`) |
| 7 HTTP | `interface/validation/projectsSchemas.ts`, `presenters/ProjectPresenter.ts`, `controllers/ProjectsController.ts` (`list`, `create`), `routes/projectsRoutes.ts` |
| 8 Wiring | add both ports to `IRepositories` (`modules/types.ts`), build them in `server.ts`, `modules/projectsModule.ts` (copy `helloModule.ts`), one line in `modules/index.ts` |
| 9 Docs | `src/docs/projectsDocs.ts` + spread in `swaggerDefinition.ts` -> `npm run docs:export`; `docs/features/projects.md` -> `npm run docs:readme` |
| 10 Tests | unit per entity/use case, e2e per route (`buildTestApp`), integration per Pg adapter; extend `InMemory<Thing>Store` |

When the real features exist, remove the demo: `helloModule.ts`, `GetHelloUseCase.ts`, `HelloController.ts`,
`helloRoutes.ts`, `helloSchemas.ts`, `HelloPresenter.ts`, `helloDocs.ts`, their tests and the
`docs/features/hello.md` page (or keep it off with `DEMO_ROUTES=false`, the production default).

## 7. Review checklist (before every push)

- [ ] Every new file is in the folder and named as section 2 says; header comment states LAYER / ROLE / RULES.
- [ ] Commands go through an entity; queries never write; read ports never return `passwordHash`-like fields.
- [ ] No `process.env` outside `config/env.ts`, no Prisma outside `infrastructure/`, no Express outside `interface/` + composition root.
- [ ] Use cases expose only `execute()`; controllers only call use cases; presenters whitelist fields.
- [ ] Expected failures are `AppError` with a catalog code; nothing else is caught and swallowed.
- [ ] Time and ids come from `IClock` / `IIdGenerator` (deterministic tests).
- [ ] `npm run verify` green; `npm run test:integration` green when adapters changed; `docs/openapi.json` re-exported.
