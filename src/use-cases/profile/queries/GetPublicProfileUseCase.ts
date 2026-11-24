/** LAYER use-cases - queries the public profile without exposing editorial metadata. */
import { AppError } from '../../../domain/errors/AppError';
import type { IProfileReadRepository, IPublicProfile, ProfileLocale } from '../../../domain/interfaces/IProfileReadRepository';

export class GetPublicProfileUseCase {
  constructor(private readonly profiles: IProfileReadRepository) {}

  async execute(locale: ProfileLocale): Promise<IPublicProfile> {
    const profile = await this.profiles.getPublicProfile(locale);
    if (!profile) throw new AppError('NOT_FOUND', 'Profile not found', 404);
    return profile;
  }
}
