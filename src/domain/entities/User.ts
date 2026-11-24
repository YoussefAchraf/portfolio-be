/**
 * LAYER    domain/entities
 * ROLE     The User aggregate: its data AND its rules (invariants). The write side of CQRS goes
 *          through entities; nothing else may create an invalid User.
 * PATTERN  Rich entity with a private constructor and two factories:
 *            User.create(...)          -> NEW user: validates + normalizes input (command side)
 *            User.fromPersistence(...) -> rebuild from a trusted DB row (repositories only)
 * USED BY  use-cases (commands), infrastructure/repositories (mapping), tests.
 * RULES    No framework imports, no I/O, no clock/random: id and time are passed in (deterministic
 *          tests). Expose read-only getters; change state only through intention-revealing methods
 *          (e.g. disable()), never by setting fields from outside.
 */
import type { Role, UserStatus } from '../constants/roles';
import { ROLES } from '../constants/roles';
import { AppError } from '../errors/AppError';

export interface IUserProps {
  id: string;
  email: string;
  passwordHash: string;
  firstname: string;
  lastname: string;
  roleName: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserInput {
  id: string;
  email: string;
  passwordHash: string;
  firstname: string;
  lastname: string;
  roleName?: Role;
  now: Date;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  private constructor(private props: IUserProps) {}

  static create(input: ICreateUserInput): User {
    const email = input.email.trim().toLowerCase();
    const firstname = input.firstname.trim();
    const lastname = input.lastname.trim();
    const roleName = input.roleName ?? 'member';

    const fields: Record<string, string> = {};
    if (email.length > 254 || !EMAIL_RE.test(email)) fields['email'] = 'validation.email';
    if (firstname.length < 1 || firstname.length > 100) fields['firstname'] = 'validation.length';
    if (lastname.length < 1 || lastname.length > 100) fields['lastname'] = 'validation.length';
    if (!ROLES.includes(roleName)) fields['roleName'] = 'validation.enum';
    if (Object.keys(fields).length > 0) throw AppError.validation(fields);

    return new User({
      id: input.id,
      email,
      passwordHash: input.passwordHash,
      firstname,
      lastname,
      roleName,
      status: 'active',
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static fromPersistence(props: IUserProps): User {
    return new User({ ...props });
  }

  disable(now: Date): void {
    this.props = { ...this.props, status: 'disabled', updatedAt: now };
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get firstname(): string {
    return this.props.firstname;
  }
  get lastname(): string {
    return this.props.lastname;
  }
  get roleName(): Role {
    return this.props.roleName;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Snapshot for repositories (write side). Never send it to a client - use a presenter. */
  toProps(): IUserProps {
    return { ...this.props };
  }
}
