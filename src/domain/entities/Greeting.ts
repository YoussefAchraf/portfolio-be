/**
 * LAYER    domain/entities
 * ROLE     A greeting someone sent from the hello page: the name they typed, stored in Postgres. Second
 *          example aggregate of the boilerplate (the first is User) - a command arriving over HTTP.
 * PATTERN  Same shape as User: private constructor, create() validates + normalizes, fromPersistence()
 *          rebuilds trusted rows, getters, toProps().
 * RULES    Name: trimmed, inner whitespace collapsed, 1-60 characters, no control characters. The
 *          frontend validates the same rule for UX; this is the rule that counts.
 */
import { AppError } from '../errors/AppError';

export interface IGreetingProps {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ICreateGreetingInput {
  id: string;
  name: string;
  now: Date;
}

export const GREETING_NAME_MAX = 60;
// eslint-disable-next-line no-control-regex -- the rule IS about rejecting control characters
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export class Greeting {
  private constructor(private readonly props: IGreetingProps) {}

  static create(input: ICreateGreetingInput): Greeting {
    const name = input.name.replace(/\s+/g, ' ').trim();
    if (name.length < 1 || name.length > GREETING_NAME_MAX || CONTROL_CHARS.test(input.name)) {
      throw AppError.validation({ name: 'validation.name' });
    }
    return new Greeting({ id: input.id, name, createdAt: input.now });
  }

  static fromPersistence(props: IGreetingProps): Greeting {
    return new Greeting({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** The message the product shows for this greeting. Business wording lives in the domain. */
  get message(): string {
    return `hello ${this.props.name}`;
  }

  toProps(): IGreetingProps {
    return { ...this.props };
  }
}
