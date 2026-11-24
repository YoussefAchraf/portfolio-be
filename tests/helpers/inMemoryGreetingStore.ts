/**
 * TEST HELPER  In-memory adapter implementing BOTH greeting ports (write + read) over one array.
 */
import type { Greeting } from '../../src/domain/entities/Greeting';
import type { IGreetingListItem, IGreetingReadRepository } from '../../src/domain/interfaces/IGreetingReadRepository';
import type { IGreetingRepository } from '../../src/domain/interfaces/IGreetingRepository';

export class InMemoryGreetingStore implements IGreetingRepository, IGreetingReadRepository {
  readonly rows: Greeting[] = [];

  async save(greeting: Greeting): Promise<void> {
    this.rows.push(greeting);
  }

  async listRecent(limit: number): Promise<IGreetingListItem[]> {
    return [...this.rows]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id))
      .slice(0, limit)
      .map((g) => ({ id: g.id, name: g.name, createdAt: g.createdAt }));
  }
}
