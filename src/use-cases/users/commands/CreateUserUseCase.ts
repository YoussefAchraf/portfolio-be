/**
 * LAYER    use-cases/<feature>/commands  (CQRS: COMMAND = changes state)
 * ROLE     One business action: register a new user. Called by an HTTP controller OR a script
 *          (scripts/seedDemoUsers.ts) - a use case does not know who calls it.
 * PATTERN  Command use case: input DTO -> check rules that need I/O (unique email) -> build the entity
 *          (entity checks its own invariants) -> persist through the write port -> return a small result.
 * SOLID    S: one action per class. D: depends only on ports (IUserRepository, IPasswordHasher, IClock,
 *          IIdGenerator) injected by the composition root - never on Prisma, bcrypt or Express.
 * RULES    Single public method execute() (lint). No HTTP concepts (req/res/status codes) - throw AppError.
 *          Return ids or entities, never response JSON (that is the presenter's job).
 */
import type { Role } from '../../../domain/constants/roles';
import { User } from '../../../domain/entities/User';
import { AppError } from '../../../domain/errors/AppError';
import type { IClock } from '../../../domain/interfaces/IClock';
import type { IIdGenerator } from '../../../domain/interfaces/IIdGenerator';
import type { ILogger } from '../../../domain/interfaces/ILogger';
import type { IPasswordHasher } from '../../../domain/interfaces/IPasswordHasher';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository';

export interface ICreateUserCommand {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  roleName?: Role;
}

export interface ICreateUserResult {
  id: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly clock: IClock,
    private readonly ids: IIdGenerator,
    private readonly logger: ILogger,
  ) {}

  async execute(command: ICreateUserCommand): Promise<ICreateUserResult> {
    const existing = await this.users.findByEmail(command.email.trim().toLowerCase());
    if (existing) throw AppError.conflict('A user with this email already exists');

    const user = User.create({
      id: this.ids.next(),
      email: command.email,
      passwordHash: await this.hasher.hash(command.password),
      firstname: command.firstname,
      lastname: command.lastname,
      roleName: command.roleName,
      now: this.clock.now(),
    });

    await this.users.save(user);
    this.logger.info('user.created', { userId: user.id, roleName: user.roleName });
    return { id: user.id };
  }
}
