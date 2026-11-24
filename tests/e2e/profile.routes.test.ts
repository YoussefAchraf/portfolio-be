import request from 'supertest';
import { buildTestApp } from '../helpers/buildTestApp';

const fixture = {
  name: 'Achraf Youssef', headline: 'Software Engineer', pitch: 'Build and ship', about: 'About',
  availability: 'Available', location: 'Tunisia', portrait: { url: '/portrait-placeholder.svg', alt: 'Portrait' },
  socialLinks: { email: 'contact@example.com', github: 'https://github.com/', linkedin: 'https://www.linkedin.com/' },
  seo: { title: 'Portfolio', description: 'Engineering portfolio', imageUrl: null }, cv: null,
};

describe('GET /v1/profile', () => {
  it('serves the default and French profiles with demo routes off', async () => {
    const { app, deps } = buildTestApp({ demoRoutes: false });
    deps.repositories.profileReads.getPublicProfile = async (locale) =>
      locale === 'fr' ? { ...fixture, headline: 'Ingenieur logiciel' } : fixture;
    await request(app).get('/v1/profile').expect(200, fixture);
    await request(app).get('/v1/profile?lang=fr').expect(200, { ...fixture, headline: 'Ingenieur logiciel' });
  });

  it('returns the standard missing and invalid-locale errors', async () => {
    const { app } = buildTestApp();
    const missing = await request(app).get('/v1/profile').expect(404);
    expect(missing.body.code).toBe('NOT_FOUND');
    const invalid = await request(app).get('/v1/profile?lang=de').expect(422);
    expect(invalid.body.code).toBe('VALIDATION_FAILED');
  });
});
