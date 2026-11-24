import { Greeting } from '../../src/domain/entities/Greeting';
import { SayHelloUseCase } from '../../src/use-cases/hello/commands/SayHelloUseCase';
import { InMemoryGreetingStore } from '../helpers/inMemoryGreetingStore';
import { FixedClock, SequenceIds, silentLogger } from '../helpers/testDoubles';

describe('Greeting entity', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('normalizes whitespace and builds the product message', () => {
    const greeting = Greeting.create({ id: 'g1', name: '  Ada   Lovelace ', now });
    expect(greeting.name).toBe('Ada Lovelace');
    expect(greeting.message).toBe('hello Ada Lovelace');
  });

  it.each([[''], ['   '], ['x'.repeat(61)], ['bad\u0000name']])('rejects %j with VALIDATION_FAILED', (name) => {
    expect(() => Greeting.create({ id: 'g1', name, now })).toThrow(expect.objectContaining({ code: 'VALIDATION_FAILED' }));
  });
});

describe('SayHelloUseCase (command)', () => {
  it('stores the greeting and returns it', async () => {
    const store = new InMemoryGreetingStore();
    const greeting = await new SayHelloUseCase(store, new FixedClock(), new SequenceIds(), silentLogger).execute({ name: 'Grace' });
    expect(greeting.message).toBe('hello Grace');
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]?.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
});
