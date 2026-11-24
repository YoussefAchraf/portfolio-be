/**
 * LAYER    interface/routes
 * ROLE     The URL map of one feature: path + middleware chain + controller method. Nothing else.
 * PATTERN  Route factory <feature>Routes(deps): Router (lint). The module mounts it under /v1/<feature>.
 * RULES    Order per route: [auth] -> [role] -> validate(...) -> controller. Paths relative to the mount
 *          point. No logic, no inline handlers beyond calling the controller.
 */
import { Router } from 'express';
import type { HelloController } from '../controllers/HelloController';
import { validate } from '../middlewares/validateRequestMiddleware';
import { createHelloBodySchema, showHelloQuerySchema } from '../validation/helloSchemas';

export function helloRoutes(deps: { controller: HelloController }): Router {
  const router = Router();
  router.get('/', validate({ query: showHelloQuerySchema }), (req, res) => deps.controller.show(req, res));
  router.post('/', validate({ body: createHelloBodySchema }), (req, res) => deps.controller.create(req, res));
  return router;
}
