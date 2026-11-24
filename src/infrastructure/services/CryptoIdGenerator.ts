/**
 * LAYER    infrastructure/services (ADAPTER)
 * ROLE     Implements IIdGenerator with UUID v4 from node:crypto (matches the uuid id columns).
 */
import { randomUUID } from 'node:crypto';
import type { IIdGenerator } from '../../domain/interfaces/IIdGenerator';

export class CryptoIdGenerator implements IIdGenerator {
  next(): string {
    return randomUUID();
  }
}
