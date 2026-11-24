import { GetHelloUseCase } from '../../src/use-cases/hello/queries/GetHelloUseCase';
import { makeUser } from '../fixtures/makeUser';
import { InMemoryGreetingStore } from '../helpers/inMemoryGreetingStore';
import { InMemoryUserStore } from '../helpers/inMemoryUserStore';

describe('GetHelloUseCase (query)', () => {
  it('returns the greeting and the newest users first, bounded by limit', async () => {
    const store = new InMemoryUserStore();
    await store.save(makeUser({ email: 'old@example.com', now: new Date('2026-01-01T00:00:00Z') }));
    await store.save(makeUser({ email: 'new@example.com', now: new Date('2026-01-02T00:00:00Z') }));

    const view = await new GetHelloUseCase(store, new InMemoryGreetingStore()).execute({ limit: 1 });

    expect(view.message).toBe('hello');
    expect(view.users.map((u) => u.email)).toEqual(['new@example.com']);
  });

  it('clamps an out-of-range limit (defense in depth)', async () => {
    const store = new InMemoryUserStore();
    const spy = jest.spyOn(store, 'listRecent');
    await new GetHelloUseCase(store, new InMemoryGreetingStore()).execute({ limit: 10_000 });
    expect(spy).toHaveBeenCalledWith(50);
  });

  it('never exposes the password hash in the read model', async () => {
    const store = new InMemoryUserStore();
    await store.save(makeUser());
    const view = await new GetHelloUseCase(store, new InMemoryGreetingStore()).execute({ limit: 10 });
    expect(view.users[0]).not.toHaveProperty('passwordHash');
  });
});
