/**
 * LAYER    composition root (PROCESS)
 * ROLE     The program entry point: config -> production adapters (modules/productionDependencies.ts)
 *          -> optional demo seed -> buildApp -> listen -> graceful shutdown.
 *          Database migrations run BEFORE this process, in the container entrypoint
 *          (docker/entrypoint.sh: prisma migrate deploy), so the schema is always current at boot.
 * RULES    SIGTERM/SIGINT: stop accepting connections, close the database, exit 0 (the container runtime
 *          restarts on crash; no process manager). A config or seed error exits 1.
 */
import { buildApp } from './app';
import { loadConfig } from './config/env';
import { seedDemoData } from './modules/demoData';
import { createProductionDependencies } from './modules/productionDependencies';

async function main(): Promise<void> {
  const config = loadConfig();
  const { deps, database } = createProductionDependencies(config);
  const { logger } = deps;

  if (config.seedDemoData) await seedDemoData(deps);

  const app = buildApp(deps, {
    corsOrigins: config.corsOrigins,
    requestBodyLimit: config.requestBodyLimit,
    demoRoutes: config.demoRoutes,
  });

  const server = app.listen(config.port, () => {
    logger.info('server.started', { port: config.port, nodeEnv: config.nodeEnv, demoRoutes: config.demoRoutes });
  });

  let stopping = false;
  const shutdown = (signal: string): void => {
    if (stopping) return;
    stopping = true;
    logger.info('server.stopping', { signal });
    server.close(() => {
      database
        .disconnect()
        .then(() => {
          logger.info('server.stopped');
          process.exit(0);
        })
        .catch((error: unknown) => {
          logger.error('server.stop_failed', { error: String(error) });
          process.exit(1);
        });
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error: unknown) => {
  // The logger may not exist yet (invalid config): write the reason to stderr and exit non-zero.
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
