/**
 * INTEGRATION  The two Prisma adapters against a REAL Postgres (npm run test:integration).
 * Needs DATABASE_URL pointing at a migrated database: CI provides it (service container + migrate deploy);
 * locally: docker compose up -d postgres && npm run db:deploy. Each test starts from an empty users table.
 */
import { Greeting } from '../../src/domain/entities/Greeting';
import { createDatabase } from '../../src/infrastructure/database/prismaClient';
import type { IDatabase } from '../../src/infrastructure/database/prismaClient';
import { PgGreetingReadRepository } from '../../src/infrastructure/repositories/PgGreetingReadRepository';
import { PgGreetingRepository } from '../../src/infrastructure/repositories/PgGreetingRepository';
import { PgUserReadRepository } from '../../src/infrastructure/repositories/PgUserReadRepository';
import { PgUserRepository } from '../../src/infrastructure/repositories/PgUserRepository';
import { makeUser } from '../fixtures/makeUser';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) throw new Error('DATABASE_URL is required for integration tests');

let database: IDatabase;

beforeAll(() => {
  database = createDatabase(databaseUrl);
});

beforeEach(async () => {
  await database.prisma.$executeRaw`TRUNCATE TABLE users, greetings`;
});

afterAll(async () => {
  await database.disconnect();
});

describe('PgUserRepository (write side)', () => {
  it('round-trips an entity and finds it by lowercase email', async () => {
    const repo = new PgUserRepository(database.prisma);
    const user = makeUser({ email: 'Mixed@Example.com' });
    await repo.save(user);
    const found = await repo.findByEmail('MIXED@example.com');
    expect(found?.toProps()).toEqual(user.toProps());
  });

  it('maps the unique-email violation to AppError CONFLICT', async () => {
    const repo = new PgUserRepository(database.prisma);
    await repo.save(makeUser({ email: 'dup@example.com' }));
    await expect(repo.save(makeUser({ email: 'dup@example.com' }))).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});

describe('PgUserReadRepository (read side)', () => {
  it('lists newest first, bounded, without the password hash', async () => {
    const writes = new PgUserRepository(database.prisma);
    await writes.save(makeUser({ email: 'old@example.com', now: new Date('2026-01-01T00:00:00Z') }));
    await writes.save(makeUser({ email: 'new@example.com', now: new Date('2026-01-02T00:00:00Z') }));

    const items = await new PgUserReadRepository(database.prisma).listRecent(1);

    expect(items.map((i) => i.email)).toEqual(['new@example.com']);
    expect(items[0]).not.toHaveProperty('passwordHash');
  });

  it('the database enforces the role enum', async () => {
    await expect(
      database.prisma.$executeRaw`INSERT INTO users (id, email, password_hash, firstname, lastname, role_name, updated_at)
        VALUES (gen_random_uuid(), 'x@example.com', 'h', 'a', 'b', 'superuser', now())`,
    ).rejects.toThrow();
  });
});

describe('Pg greeting repositories', () => {
  it('stores greetings and lists them newest first', async () => {
    const writes = new PgGreetingRepository(database.prisma);
    await writes.save(Greeting.create({ id: '00000000-0000-4000-a000-000000000001', name: 'Old', now: new Date('2026-01-01T00:00:00Z') }));
    await writes.save(Greeting.create({ id: '00000000-0000-4000-a000-000000000002', name: 'New', now: new Date('2026-01-02T00:00:00Z') }));
    const items = await new PgGreetingReadRepository(database.prisma).listRecent(10);
    expect(items.map((g) => g.name)).toEqual(['New', 'Old']);
  });
});
