/**
 * LAYER    interface/routes
 * ROLE     /health and /ready, mounted at the root (unversioned) BEFORE other middleware-heavy routes.
 */
import { Router } from 'express';
import type { HealthController } from '../controllers/HealthController';

export function healthRoutes(deps: { controller: HealthController }): Router {
  const router = Router();
  router.get('/health', (req, res) => deps.controller.live(req, res));
  router.get('/ready', (req, res) => deps.controller.ready(req, res));
  return router;
}
