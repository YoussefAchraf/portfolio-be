/**
 * LAYER    modules (composition root)
 * ROLE     The boilerplate's demo rows, inserted through the CreateUserUseCase COMMAND (never raw SQL), so
 *          every entity invariant applies. Used at boot by server.ts when SEED_DEMO_DATA=true (a fresh
 *          deployment shows data on GET /v1/hello immediately) and by scripts/seedDemoUsers.ts.
 * RULES    Idempotent: an existing email (AppError CONFLICT) is skipped. Passwords are random and never
 *          logged - demo users are display data, not accounts. Remove with the rest of the demo.
 */
import { randomBytes } from 'node:crypto';
import type { ISharedDependencies } from './types';
import { AppError } from '../domain/errors/AppError';
import { ERROR_CODES } from '../domain/errors/errorCodes';
import { CreateUserUseCase } from '../use-cases/users/commands/CreateUserUseCase';

const DEMO_USERS = [
  { email: 'ada.lovelace@example.com', firstname: 'Ada', lastname: 'Lovelace', roleName: 'admin' as const },
  { email: 'alan.turing@example.com', firstname: 'Alan', lastname: 'Turing', roleName: 'member' as const },
  { email: 'grace.hopper@example.com', firstname: 'Grace', lastname: 'Hopper', roleName: 'member' as const },
];

export interface IDemoSeedResult {
  created: number;
  existing: number;
}

export async function seedDemoData(deps: ISharedDependencies): Promise<IDemoSeedResult> {
  const createUser = new CreateUserUseCase(deps.repositories.users, deps.hasher, deps.clock, deps.ids, deps.logger);
  const result: IDemoSeedResult = { created: 0, existing: 0 };
  for (const demo of DEMO_USERS) {
    try {
      await createUser.execute({ ...demo, password: randomBytes(24).toString('base64url') });
      result.created += 1;
    } catch (error) {
      if (error instanceof AppError && error.code === ERROR_CODES.CONFLICT) result.existing += 1;
      else throw error;
    }
  }
  deps.logger.info('demo_data.seeded', { ...result });
  return result;
}
