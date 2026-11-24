import request from 'supertest';
import { CreateUserUseCase } from '../../src/use-cases/users/commands/CreateUserUseCase';
import { buildTestApp } from '../helpers/buildTestApp';

describe('GET /v1/hello (through the real app, in-memory adapters)', () => {
  it('returns hello and the seeded users in the contract shape', async () => {
    const { app, deps } = buildTestApp();
    const createUser = new CreateUserUseCase(deps.repositories.users, deps.hasher, deps.clock, deps.ids, deps.logger);
    await createUser.execute({ email: 'ada@example.com', password: 'x', firstname: 'Ada', lastname: 'Lovelace', roleName: 'admin' });

    const res = await request(app).get('/v1/hello');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'hello',
      users: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          email: 'ada@example.com',
          firstname: 'Ada',
          lastname: 'Lovelace',
          roleName: 'admin',
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      greetings: [],
    });
  });

  it('POST stores a greeting, answers 201 "hello <name>", and GET lists it', async () => {
    const { app } = buildTestApp();
    const created = await request(app).post('/v1/hello').send({ name: '  Ada ' });
    expect(created.status).toBe(201);
    expect(created.body).toEqual({
      message: 'hello Ada',
      greeting: { id: '00000000-0000-4000-8000-000000000001', name: 'Ada', createdAt: '2026-01-01T00:00:00.000Z' },
    });
    const list = await request(app).get('/v1/hello');
    expect(list.body.greetings).toEqual([created.body.greeting]);
  });

  it('POST rejects a missing or too long name with 422 and field details', async () => {
    const { app } = buildTestApp();
    for (const body of [{}, { name: '' }, { name: 'x'.repeat(61) }]) {
      const res = await request(app).post('/v1/hello').send(body);
      expect(res.status).toBe(422);
      expect(res.body.details.fields).toHaveProperty('name');
    }
  });

  it('rejects an invalid limit with 422 VALIDATION_FAILED and field details', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/v1/hello?limit=0');
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.details.fields).toHaveProperty('limit');
  });

  it('is not mounted when demo routes are off', async () => {
    const { app } = buildTestApp({ demoRoutes: false });
    const res = await request(app).get('/v1/hello');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Route not found', code: 'NOT_FOUND' });
  });
});
