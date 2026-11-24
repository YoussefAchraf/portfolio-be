/**
 * LAYER    infrastructure/repositories (ADAPTER - read side of CQRS)
 * ROLE     Implements IUserReadRepository: one optimized query per screen, selecting ONLY the columns the
 *          read model needs (passwordHash is never selected, so it can never leak).
 * PATTERN  Query object / read repository. No entity mapping - read models are plain data.
 * RULES    Class name Pg<Thing>Repository (lint). Every list is bounded (take) and ordered by an indexed
 *          column (see @@index in prisma/schema.prisma). Never writes.
 */
import type { IUserListItem, IUserReadRepository } from '../../domain/interfaces/IUserReadRepository';
import type { PrismaClient } from '../../generated/prisma/client';

export class PgUserReadRepository implements IUserReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRecent(limit: number): Promise<IUserListItem[]> {
    return this.prisma.user.findMany({
      select: { id: true, email: true, firstname: true, lastname: true, roleName: true, status: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: limit,
    });
  }
}
