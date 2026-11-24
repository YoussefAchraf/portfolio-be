/**
 * LAYER    domain/interfaces (PORT - write side of CQRS)
 * ROLE     What commands need to persist a Greeting. Implemented by PgGreetingRepository.
 */
import type { Greeting } from '../entities/Greeting';

export interface IGreetingRepository {
  save(greeting: Greeting): Promise<void>;
}
