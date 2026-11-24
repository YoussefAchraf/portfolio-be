/**
 * TEST HELPER  Deterministic doubles for the cross-cutting ports: fixed clock, predictable ids, a fake
 * hasher (no bcrypt cost in unit tests), a silent logger and a switchable readiness probe.
 */
import type { IClock } from '../../src/domain/interfaces/IClock';
import type { IIdGenerator } from '../../src/domain/interfaces/IIdGenerator';
import type { ILogger } from '../../src/domain/interfaces/ILogger';
import type { IPasswordHasher } from '../../src/domain/interfaces/IPasswordHasher';
import type { IReadinessProbe } from '../../src/domain/interfaces/IReadinessProbe';

export class FixedClock implements IClock {
  constructor(private current = new Date('2026-01-01T00:00:00.000Z')) {}
  now(): Date {
    return new Date(this.current);
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

export class SequenceIds implements IIdGenerator {
  private n = 0;
  next(): string {
    this.n += 1;
    return `00000000-0000-4000-8000-${String(this.n).padStart(12, '0')}`;
  }
}

export const fakeHasher: IPasswordHasher = {
  hash: async (plain) => `hashed:${plain}`,
  verify: async (plain, hash) => hash === `hashed:${plain}`,
};

export const silentLogger: ILogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };

export class SwitchProbe implements IReadinessProbe {
  constructor(
    public readonly name: string,
    public up = true,
  ) {}
  async check(): Promise<boolean> {
    return this.up;
  }
}
