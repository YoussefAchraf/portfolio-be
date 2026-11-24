/**
 * LAYER    composition root (WIRING)
 * ROLE     Builds the Express app from already-constructed dependencies: global middleware in a fixed
 *          order, /health + /ready, every feature module under /v1, then 404 and the error handler.
 *          No process concerns (no env, no listen, no DB connect) - that is server.ts - so tests can
 *          build the same app with in-memory dependencies (tests/helpers/buildTestApp.ts).
 * ORDER    requestLogger -> health -> helmet -> cors -> json(limit) -> /v1/<feature> -> notFound -> errorHandler
 *          Future global pieces (cookies, rate limiting, CSRF, auth) slot in before the /v1 mounts.
 * RULES    app.ts does not change when a feature is added (modules/index.ts does).
 */
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import { errorHandlerMiddleware } from './interface/middlewares/errorHandlerMiddleware';
import { notFoundMiddleware } from './interface/middlewares/notFoundMiddleware';
import { requestLoggerMiddleware } from './interface/middlewares/requestLoggerMiddleware';
import { createHealthRouter } from './modules/healthModule';
import { featureModules } from './modules/index';
import type { ISharedDependencies } from './modules/types';

export interface IAppOptions {
  corsOrigins: string[];
  requestBodyLimit: string;
  demoRoutes: boolean;
}

export function buildApp(deps: ISharedDependencies, options: IAppOptions): Express {
  const app = express();

  app.use(requestLoggerMiddleware({ logger: deps.logger }));
  app.use(createHealthRouter(deps));

  app.use(helmet());
  app.use(cors({ origin: options.corsOrigins, credentials: true }));
  app.use(express.json({ limit: options.requestBodyLimit }));

  for (const createModule of featureModules({ demoRoutes: options.demoRoutes })) {
    const feature = createModule(deps);
    app.use(`/v1${feature.basePath}`, feature.router);
    deps.logger.debug('module.mounted', { name: feature.name, path: `/v1${feature.basePath}` });
  }

  app.use(notFoundMiddleware());
  app.use(errorHandlerMiddleware({ logger: deps.logger }));
  return app;
}
