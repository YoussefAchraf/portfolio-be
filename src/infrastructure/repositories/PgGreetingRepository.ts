/**
 * LAYER    infrastructure/repositories (ADAPTER - write side of CQRS)
 * ROLE     Implements IGreetingRepository with Prisma: entity -> row (toProps). Same shape as PgUserRepository.
 */
import type { Greeting } from '../../domain/entities/Greeting';
import type { IGreetingRepository } from '../../domain/interfaces/IGreetingRepository';
import type { PrismaClient } from '../../generated/prisma/client';

export class PgGreetingRepository implements IGreetingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(greeting: Greeting): Promise<void> {
    await this.prisma.greeting.create({ data: greeting.toProps() });
  }
}
