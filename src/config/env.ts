/**
 * LAYER    config
 * ROLE     The ONLY file in src/ that reads process.env (lint bans it everywhere else). Validates every
 *          variable with zod at boot and returns one typed, frozen IAppConfig. Invalid env = the process
 *          refuses to start with a readable list of the bad keys (fail fast), never a half-working server.
 * USED BY  server.ts and scripts/ (composition roots) - everything else receives config values through
 *          constructors / factory arguments.
 * RULES    One variable = one schema line with a safe default or none (required). Never put secret
 *          VALUES in error messages. Every variable read here is listed in .env.example and
 *          docs/configuration.md. Add a variable only when code uses it.
 */
import 'dotenv/config';
import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  REQUEST_BODY_LIMIT: z.string().default('100kb'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().url(),
  // Demo routes (GET /v1/hello) - on by default except in production.
  DEMO_ROUTES: booleanString.optional(),
  // Insert the demo users at boot (idempotent). Off unless explicitly true, in every environment.
  SEED_DEMO_DATA: booleanString.default(false),
});

export interface IAppConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly logLevel: string;
  readonly requestBodyLimit: string;
  readonly corsOrigins: string[];
  readonly databaseUrl: string;
  readonly demoRoutes: boolean;
  readonly seedDemoData: boolean;
}

export function loadConfig(source: Record<string, string | undefined> = process.env): IAppConfig {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n- ${keys.join('\n- ')}`);
  }
  const env = parsed.data;
  return Object.freeze({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    requestBodyLimit: env.REQUEST_BODY_LIMIT,
    corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
    databaseUrl: env.DATABASE_URL,
    demoRoutes: env.DEMO_ROUTES ?? env.NODE_ENV !== 'production',
    seedDemoData: env.SEED_DEMO_DATA,
  });
}
