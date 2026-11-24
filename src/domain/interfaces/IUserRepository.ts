/**
 * LAYER    domain/interfaces (PORT - write side of CQRS)
 * ROLE     What COMMAND use cases need to load and persist the User aggregate. Speaks entities only.
 * PATTERN  Repository (one per aggregate) + Dependency Inversion: the domain owns this interface,
 *          infrastructure/repositories/PgUserRepository.ts implements it, use cases depend on it.
 * RULES    Methods named after domain needs (findByEmail, save), never after SQL. No Prisma types here.
 *          Return entities (or null), never raw rows. Reads for screens/lists go to IUserReadRepository.
 */
import type { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Insert or update. Throws AppError CONFLICT when the email is already taken. */
  save(user: User): Promise<void>;
}
