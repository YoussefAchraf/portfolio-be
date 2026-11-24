/**
 * FIXTURE (object mother)  A valid User with overridable fields. Tests state only what matters to them.
 */
import type { ICreateUserInput } from '../../src/domain/entities/User';
import { User } from '../../src/domain/entities/User';

let counter = 0;

export function makeUser(overrides: Partial<ICreateUserInput> = {}): User {
  counter += 1;
  return User.create({
    id: `00000000-0000-4000-9000-${String(counter).padStart(12, '0')}`,
    email: `user${counter}@example.com`,
    passwordHash: 'hashed:secret',
    firstname: 'Test',
    lastname: `User${counter}`,
    now: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}
