/**
 * LAYER    infrastructure/repositories (ADAPTER - write side of CQRS)
 * ROLE     Implements the domain port IUserRepository with Prisma/Postgres. Translates both ways:
 *          DB row -> User.fromPersistence(...) and User.toProps() -> DB row.
 * PATTERN  Repository + Data Mapper (mapRow). The only place that knows table/column details for writes.
 * RULES    Class name Pg<Thing>Repository (lint). Return entities, never Prisma rows. Translate DB errors
 *          that are business facts (unique violation P2002 -> AppError CONFLICT); let others bubble up
 *          (the error handler answers 500). Raw SQL only as parameterized tagged templates.
 */
import { User } from '../../domain/entities/User';
import { AppError } from '../../domain/errors/AppError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { Prisma } from '../../generated/prisma/client';
import type { User as UserRow, PrismaClient } from '../../generated/prisma/client';

function mapRow(row: UserRow): User {
  return User.fromPersistence({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    firstname: row.firstname,
    lastname: row.lastname,
    roleName: row.roleName,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PgUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return row ? mapRow(row) : null;
  }

  async save(user: User): Promise<void> {
    const { id, ...data } = user.toProps();
    try {
      await this.prisma.user.upsert({ where: { id }, create: { id, ...data }, update: data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.conflict('A user with this email already exists');
      }
      throw error;
    }
  }
}
