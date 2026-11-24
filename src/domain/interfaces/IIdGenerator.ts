/**
 * LAYER    domain/interfaces (PORT - determinism)
 * ROLE     New identifiers as a dependency, so tests can predict ids.
 * IMPL     infrastructure/services/CryptoIdGenerator.ts (UUID v4), a sequence in tests.
 */
export interface IIdGenerator {
  next(): string;
}
