/**
 * LAYER    infrastructure/services (ADAPTER)
 * ROLE     Implements IClock with the real system time. Tests inject a fixed clock instead.
 */
import type { IClock } from '../../domain/interfaces/IClock';

export class SystemClock implements IClock {
  now(): Date {
    return new Date();
  }
}
