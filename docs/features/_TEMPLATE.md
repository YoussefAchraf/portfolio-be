---
feature: <kebab-name>
title: <Human title>
status: planned            # planned | in-progress | released | deprecated
since: -                   # version that first shipped it to main (set by the release task)
task: <NNN>                # task id(s), comma-separated
summary: <One sentence: what the feature gives the user/system.>
endpoints: <METHOD /v1/path, METHOD /v1/path>   # only /v1 operations in docs/openapi.json; empty for ops-only features (/health, /ready: describe them in the text)
---

# <Human title>

> Copy this file to `docs/features/<feature>.md`. The front-matter feeds the README feature table
> (`npm run docs:readme`); keep it accurate. Write for an engineer joining the team: what, how, where.

## Overview

<What problem it solves, for which role, main rules. 3-6 lines.>

## Contract

- OpenAPI: `contracts/openapi/<feature>.yaml` (workspace) - operations: `<operationId>`, ...
- Error codes: `<CODE>` (when), ...

## How it works

<Request flow / sequence (a mermaid `sequenceDiagram` is welcome), business rules, invariants,
transactions, caching, rate limits.>

## Code map

| Layer | Files |
|---|---|
| Domain | `src/domain/...` |
| Use cases | `src/use-cases/<feature>/...` |
| Infrastructure | `src/infrastructure/...` |
| Interface | `src/interface/...` |
| Composition | `src/modules/<feature>Module.ts` |

## Data

<Tables/columns added, indexes and why, migrations (name), tenancy scope.>

## Configuration

<Env variables / feature flags used, with defaults. "None" if none.>

## Testing

<Which unit / integration / e2e tests cover it and how to run them.>

## Operational notes

<Logs/metrics to watch, known limits, runbook hints.>
