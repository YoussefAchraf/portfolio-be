/** LAYER infrastructure/repositories - database projection for the public profile. */
import type { IProfileReadRepository, IPublicProfile, ProfileLocale } from '../../domain/interfaces/IProfileReadRepository';
import type { PrismaClient } from '../../generated/prisma/client';

export class PgProfileReadRepository implements IProfileReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getPublicProfile(locale: ProfileLocale): Promise<IPublicProfile | null> {
    const profile = await this.prisma.profile.findUnique({ where: { id: 1 } });
    if (!profile) return null;
    const copy = locale === 'fr' ? profile.fr : profile.en;
    const localized = copy as unknown as Omit<IPublicProfile, 'name' | 'socialLinks' | 'cv'>;
    return {
      name: profile.name,
      headline: localized.headline,
      pitch: localized.pitch,
      about: localized.about,
      availability: localized.availability,
      location: localized.location,
      portrait: { url: localized.portrait.url, alt: localized.portrait.alt },
      socialLinks: { email: profile.email, github: profile.github, linkedin: profile.linkedin },
      seo: { title: localized.seo.title, description: localized.seo.description, imageUrl: localized.seo.imageUrl },
      cv: null,
    };
  }
}
