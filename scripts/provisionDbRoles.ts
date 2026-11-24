/**
 * FILE:   scripts/provisionDbRoles.ts      (npm run db:provision-roles)
 * STATUS: placeholder - implement before the first non-local deployment.
 *
 * PURPOSE
 *   Least-privilege database roles:
 *     app_migrator  owns the schema; used ONLY by `prisma migrate deploy` (DDL)
 *     app_runtime   used by the running app (DML: SELECT/INSERT/UPDATE/DELETE, no DDL)
 *
 * WHAT TO WRITE
 *   - Connect with an admin URL from env (DATABASE_ADMIN_URL), never the app URL.
 *   - Idempotent SQL: CREATE ROLE ... IF NOT EXISTS pattern (DO $$ ... $$), GRANT USAGE on
 *     schema, GRANT DML on all tables, ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator so future
 *     tables are covered automatically.
 *   - Passwords come from env (APP_RUNTIME_PASSWORD / APP_MIGRATOR_PASSWORD); never hard-coded,
 *     never logged. Use parameterized statements or a vetted identifier/literal escaper.
 */
export {};
