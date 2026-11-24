/**
 * LAYER    modules (composition root)
 * ROLE     Wires /health and /ready from the shared readiness probes. Mounted at the root by app.ts,
 *          before every other feature (not under /v1).
 */
import type { Router } from 'express';
import type { ISharedDependencies } from './types';
import { HealthController } from '../interface/controllers/HealthController';
import { healthRoutes } from '../interface/routes/healthRoutes';

export function createHealthRouter(deps: ISharedDependencies): Router {
  return healthRoutes({ controller: new HealthController(deps.probes) });
}
