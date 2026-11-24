/**
 * LAYER    modules (composition root)
 * ROLE     The feature registry: the ordered list of modules app.ts mounts under /v1.
 * RULES    One line per feature. Optional/demo features are switched by config here, never inside app.ts.
 */
import { createHelloModule } from './helloModule';
import type { FeatureModuleFactory } from './types';

export function featureModules(options: { demoRoutes: boolean }): FeatureModuleFactory[] {
  return [
    ...(options.demoRoutes ? [createHelloModule] : []),
    // createProjectsModule,   <- one line per real feature
  ];
}
