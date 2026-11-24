import { User } from '../../src/domain/entities/User';
import { AppError } from '../../src/domain/errors/AppError';

const base = {
  id: '00000000-0000-4000-8000-000000000001',
  email: '  Ada.Lovelace@Example.COM ',
  passwordHash: 'hashed:x',
  firstname: ' Ada ',
  lastname: 'Lovelace',
  now: new Date('2026-01-01T00:00:00.000Z'),
};

describe('User entity', () => {
  it('normalizes input and applies defaults', () => {
    const user = User.create(base);
    expect(user.email).toBe('ada.lovelace@example.com');
    expect(user.firstname).toBe('Ada');
    expect(user.roleName).toBe('member');
    expect(user.status).toBe('active');
    expect(user.createdAt).toEqual(base.now);
  });

  it('rejects invalid fields with VALIDATION_FAILED and per-field i18n keys', () => {
    expect.assertions(3);
    try {
      User.create({ ...base, email: 'not-an-email', firstname: '' });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION_FAILED');
      expect((error as AppError).details).toEqual({ fields: { email: 'validation.email', firstname: 'validation.length' } });
    }
  });

  it('changes state only through intention-revealing methods', () => {
    const user = User.create(base);
    const later = new Date('2026-02-01T00:00:00.000Z');
    user.disable(later);
    expect(user.status).toBe('disabled');
    expect(user.updatedAt).toEqual(later);
  });
});
