/**
 * LAYER    infrastructure/repositories (ADAPTER - read side of CQRS)
 * ROLE     Implements IGreetingReadRepository: one bounded, indexed query returning plain read models.
 */
import type { IGreetingListItem, IGreetingReadRepository } from '../../domain/interfaces/IGreetingReadRepository';
import type { PrismaClient } from '../../generated/prisma/client';

export class PgGreetingReadRepository implements IGreetingReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRecent(limit: number): Promise<IGreetingListItem[]> {
    return this.prisma.greeting.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: limit,
    });
  }
}
