/**
 * LAYER    modules (composition root)
 * ROLE     Wires ONE feature bottom-up: ports (from shared deps) -> use cases -> controller -> routes.
 *          This is the only file of the feature that knows every piece; each piece knows only its
 *          neighbours' interfaces.
 * PATTERN  create<Feature>Module: FeatureModuleFactory. Adding a feature = one new module + one line in
 *          modules/index.ts; app.ts never changes.
 * NOTE     Demo feature of the boilerplate (GET /v1/hello). Copy its shape for real features, then delete
 *          it (or keep it off with DEMO_ROUTES=false; it is off in production by default).
 */
import type { FeatureModuleFactory } from './types';
import { HelloController } from '../interface/controllers/HelloController';
import { helloRoutes } from '../interface/routes/helloRoutes';
import { SayHelloUseCase } from '../use-cases/hello/commands/SayHelloUseCase';
import { GetHelloUseCase } from '../use-cases/hello/queries/GetHelloUseCase';

export const createHelloModule: FeatureModuleFactory = (deps) => {
  const getHello = new GetHelloUseCase(deps.repositories.userReads, deps.repositories.greetingReads);
  const sayHello = new SayHelloUseCase(deps.repositories.greetings, deps.clock, deps.ids, deps.logger);
  const controller = new HelloController(getHello, sayHello);
  return { name: 'hello', basePath: '/hello', router: helloRoutes({ controller }) };
};
