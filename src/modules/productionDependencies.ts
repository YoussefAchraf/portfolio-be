/**
 * LAYER    modules (composition root)
 * ROLE     THE place that chooses production implementations for every port: Postgres repositories,
 *          bcrypt, pino, system clock, UUIDs. Shared by server.ts and scripts/ so they can never wire
 *          the app differently. Tests build their own set (tests/helpers/buildTestApp.ts).
 * RULES    One call per process. The caller owns the returned database and must disconnect it on exit.
 *          A new feature's repositories are constructed here (and declared in types.ts IRepositories).
 */
import type { ISharedDependencies } from './types';
import type { IAppConfig } from '../config/env';
import type { IDatabase } from '../infrastructure/database/prismaClient';
import { createDatabase } from '../infrastructure/database/prismaClient';
import { PgGreetingReadRepository } from '../infrastructure/repositories/PgGreetingReadRepository';
import { PgGreetingRepository } from '../infrastructure/repositories/PgGreetingRepository';
import { PgProfileReadRepository } from '../infrastructure/repositories/PgProfileReadRepository';
import { PgUserReadRepository } from '../infrastructure/repositories/PgUserReadRepository';
import { PgUserRepository } from '../infrastructure/repositories/PgUserRepository';
import { BcryptPasswordHasher } from '../infrastructure/security/BcryptPasswordHasher';
import { CryptoIdGenerator } from '../infrastructure/services/CryptoIdGenerator';
import { PinoLogger } from '../infrastructure/services/PinoLogger';
import { SystemClock } from '../infrastructure/services/SystemClock';

export interface IProductionDependencies {
  deps: ISharedDependencies;
  database: IDatabase;
}

export function createProductionDependencies(config: IAppConfig): IProductionDependencies {
  const database = createDatabase(config.databaseUrl);
  const deps: ISharedDependencies = {
    logger: new PinoLogger({ level: config.logLevel }),
    clock: new SystemClock(),
    ids: new CryptoIdGenerator(),
    hasher: new BcryptPasswordHasher(),
    repositories: {
      users: new PgUserRepository(database.prisma),
      userReads: new PgUserReadRepository(database.prisma),
      greetings: new PgGreetingRepository(database.prisma),
      greetingReads: new PgGreetingReadRepository(database.prisma),
      profileReads: new PgProfileReadRepository(database.prisma),
    },
    probes: [database.probe],
  };
  return { deps, database };
}
