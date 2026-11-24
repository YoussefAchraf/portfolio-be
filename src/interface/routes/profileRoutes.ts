/** LAYER interface/routes - mounts the public profile read. */
import { Router } from 'express';
import type { ProfileController } from '../controllers/ProfileController';
import { validate } from '../middlewares/validateRequestMiddleware';
import { showProfileQuerySchema } from '../validation/profileSchemas';

export function profileRoutes(deps: { controller: ProfileController }): Router {
  const router = Router();
  router.get('/', validate({ query: showProfileQuerySchema }), (req, res) => deps.controller.show(req, res));
  return router;
}
