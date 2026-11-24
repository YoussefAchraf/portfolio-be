/**
 * SCRIPT   npm run db:seed   (after npm run db:migrate / db:deploy)
 * ROLE     Inserts the demo users from a developer machine, so GET /v1/hello returns real rows.
 *          Deployed containers do the same at boot with SEED_DEMO_DATA=true (src/server.ts).
 * PATTERN  A script is another COMPOSITION ROOT: same production wiring as server.ts
 *          (createProductionDependencies) and the same demo data function (modules/demoData.ts), which
 *          goes through the CreateUserUseCase command - never raw SQL.
 * RULES    Idempotent. Refuses NODE_ENV=production unless SEED_DEMO_DATA=true is set explicitly.
 */
import { loadConfig } from '../src/config/env';
import { seedDemoData } from '../src/modules/demoData';
import { createProductionDependencies } from '../src/modules/productionDependencies';

async function run(): Promise<void> {
  const config = loadConfig();
  if (config.nodeEnv === 'production' && !config.seedDemoData) {
    throw new Error('db:seed refuses NODE_ENV=production unless SEED_DEMO_DATA=true');
  }
  const { deps, database } = createProductionDependencies(config);
  try {
    const { created, existing } = await seedDemoData(deps);
    console.log(`demo users: ${created} created, ${existing} already present`);
  } finally {
    await database.disconnect();
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
