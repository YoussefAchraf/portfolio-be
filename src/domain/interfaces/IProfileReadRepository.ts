/** LAYER domain/interfaces - localized public profile read port. */
export type ProfileLocale = 'en' | 'fr';

export interface IPublicProfile {
  name: string;
  headline: string;
  pitch: string;
  about: string;
  availability: string;
  location: string;
  portrait: { url: string; alt: string };
  socialLinks: { email: string; github: string; linkedin: string };
  seo: { title: string; description: string; imageUrl: string | null };
  cv: { url: string; label: string } | null;
}

export interface IProfileReadRepository {
  getPublicProfile(locale: ProfileLocale): Promise<IPublicProfile | null>;
}
