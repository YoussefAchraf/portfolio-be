/**
 * LAYER    domain/interfaces (PORT - operations)
 * ROLE     One external dependency's health for GET /ready (Postgres today; Redis, queues... later).
 * IMPL     Each adapter that owns a connection exposes one (infrastructure/database/prismaClient.ts).
 */
export interface IReadinessProbe {
  readonly name: string;
  /** Resolves true when the dependency answers; never throws. */
  check(): Promise<boolean>;
}
