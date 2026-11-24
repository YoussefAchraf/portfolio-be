import { createDatabase } from '../../src/infrastructure/database/prismaClient';
import { PgProfileReadRepository } from '../../src/infrastructure/repositories/PgProfileReadRepository';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) throw new Error('DATABASE_URL is required for integration tests');
const { prisma } = createDatabase(databaseUrl);

afterAll(async () => prisma.$disconnect());

it('reads both locales from the migrated singleton and hides its editorial flag', async () => {
  const repository = new PgProfileReadRepository(prisma);
  const english = await repository.getPublicProfile('en');
  const french = await repository.getPublicProfile('fr');
  expect(english?.headline).toContain('Software Engineer');
  expect(french?.headline).toContain('Ingénieur logiciel');
  expect(english).not.toHaveProperty('placeholder');
  expect(english?.cv).toBeNull();
});
