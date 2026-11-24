// Prisma 7 configuration (CLI: generate, migrate dev/deploy/status).
// DATABASE_URL lives here, not in schema.prisma (Prisma 7 layout).
// Loaded by the Prisma CLI only - never imported by src/.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
