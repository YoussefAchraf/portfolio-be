/** LAYER modules - wires the public profile read. */
import type { FeatureModuleFactory } from './types';
import { ProfileController } from '../interface/controllers/ProfileController';
import { profileRoutes } from '../interface/routes/profileRoutes';
import { GetPublicProfileUseCase } from '../use-cases/profile/queries/GetPublicProfileUseCase';

export const createProfileModule: FeatureModuleFactory = (deps) => {
  const query = new GetPublicProfileUseCase(deps.repositories.profileReads);
  return { name: 'profile', basePath: '/profile', router: profileRoutes({ controller: new ProfileController(query) }) };
};
