import { CreateUserUseCase } from '../../src/use-cases/users/commands/CreateUserUseCase';
import { InMemoryUserStore } from '../helpers/inMemoryUserStore';
import { FixedClock, SequenceIds, fakeHasher, silentLogger } from '../helpers/testDoubles';

function setup(): { useCase: CreateUserUseCase; store: InMemoryUserStore } {
  const store = new InMemoryUserStore();
  const useCase = new CreateUserUseCase(store, fakeHasher, new FixedClock(), new SequenceIds(), silentLogger);
  return { useCase, store };
}

const command = { email: 'Grace@Example.com', password: 'secret', firstname: 'Grace', lastname: 'Hopper' };

describe('CreateUserUseCase (command)', () => {
  it('creates the user through the entity and persists it with a hashed password', async () => {
    const { useCase, store } = setup();
    const { id } = await useCase.execute(command);
    const saved = await store.findById(id);
    expect(id).toBe('00000000-0000-4000-8000-000000000001');
    expect(saved?.email).toBe('grace@example.com');
    expect(saved?.passwordHash).toBe('hashed:secret');
  });

  it('rejects a duplicate email (case-insensitive) with CONFLICT', async () => {
    const { useCase } = setup();
    await useCase.execute(command);
    await expect(useCase.execute({ ...command, email: 'GRACE@example.com' })).rejects.toMatchObject({ code: 'CONFLICT', status: 409 });
  });

  it('lets entity invariants reject invalid input', async () => {
    const { useCase } = setup();
    await expect(useCase.execute({ ...command, email: 'nope' })).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});
