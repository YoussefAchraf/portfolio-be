/**
 * LAYER    domain/interfaces (PORT - determinism)
 * ROLE     "What time is it?" as a dependency, so use cases and tests never call new Date() directly.
 * IMPL     infrastructure/services/SystemClock.ts (production), a fixed clock in tests.
 */
export interface IClock {
  now(): Date;
}
