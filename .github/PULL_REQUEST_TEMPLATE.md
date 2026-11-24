## Task

- Brief: `contracts/tasks/NNN-be-<slug>.md`
- Branch: `<type>/NNN-<slug>` (agents/ENGINEER.md 7)

## What & why

<!-- 2-5 lines. Link contract operations (contracts/openapi/<feature>.yaml#operationId). -->

## Verification

- [ ] `npm run verify` green locally (lint + typecheck + tests with Postgres + Redis)
- [ ] `npm run docs:export` run and `docs/openapi.json` committed (if routes changed)
- [ ] Unit tests for use cases, integration tests for repository methods, e2e for routes

## Architecture & contract

- [ ] Layers respected (boundaries lint), feature wired through `src/modules/`
- [ ] Shapes, status codes and error codes match the contract exactly; responses built by presenters
- [ ] Migrations additive-safe; destructive changes flagged with an approved ADR

## Hygiene

- [ ] Feature page in `docs/features/`, CHANGELOG line, `npm run docs:readme` run (README generated sections current)
- [ ] `## Result` written in the task brief
- [ ] No-attribution self-check printed `clean` (commits, branch, this PR text)
