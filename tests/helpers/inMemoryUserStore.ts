/**
 * TEST HELPER  In-memory adapter implementing BOTH user ports (write + read) over one Map, so a command
 * and a query in the same test see the same data - exactly like the two Pg repositories over one table.
 * It proves the Liskov rule: use cases and the HTTP app run unchanged on any implementation of a port.
 */
import type { User } from '../../src/domain/entities/User';
import { AppError } from '../../src/domain/errors/AppError';
import type { IUserListItem, IUserReadRepository } from '../../src/domain/interfaces/IUserReadRepository';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';

export class InMemoryUserStore implements IUserRepository, IUserReadRepository {
  private readonly rows = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.rows.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.rows.values()].find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async save(user: User): Promise<void> {
    const clash = [...this.rows.values()].find((other) => other.email === user.email && other.id !== user.id);
    if (clash) throw AppError.conflict('A user with this email already exists');
    this.rows.set(user.id, user);
  }

  async listRecent(limit: number): Promise<IUserListItem[]> {
    return [...this.rows.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id))
      .slice(0, limit)
      .map((user) => ({
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roleName: user.roleName,
        status: user.status,
        createdAt: user.createdAt,
      }));
  }
}
