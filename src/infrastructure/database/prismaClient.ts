/**
 * LAYER    infrastructure/database
 * ROLE     Owns the ONE database connection pool of the process: creates the Prisma client (Prisma 7
 *          driver adapter for node-postgres), exposes a readiness probe and a disconnect for shutdown.
 * USED BY  Composition roots only (server.ts, scripts/, tests/integration) - they pass `prisma` into
 *          repository constructors. Use cases never see this file.
 * RULES    One createDatabase() per process. Never import the generated client outside infrastructure/
 *          (lint). The URL comes from config (IAppConfig.databaseUrl), never from process.env here.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import type { IReadinessProbe } from '../../domain/interfaces/IReadinessProbe';
import { PrismaClient } from '../../generated/prisma/client';

export interface IDatabase {
  readonly prisma: PrismaClient;
  readonly probe: IReadinessProbe;
  disconnect(): Promise<void>;
}

export function createDatabase(databaseUrl: string): IDatabase {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  const probe: IReadinessProbe = {
    name: 'postgres',
    async check(): Promise<boolean> {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    },
  };

  return {
    prisma,
    probe,
    disconnect: () => prisma.$disconnect(),
  };
}
