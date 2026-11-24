/**
 * LAYER    use-cases/<feature>/queries  (CQRS: QUERY = reads, never changes state)
 * ROLE     GET /v1/hello: a greeting plus the most recent users and greetings from the database. Proves
 *          the read chain: HTTP -> controller -> use case -> read ports -> Postgres.
 * PATTERN  Query use case: input DTO -> read ports -> one view model. No entity is loaded and no
 *          invariant runs, because nothing changes.
 * SOLID    S: one question per class. D: depends on read PORTS, not on Prisma.
 * RULES    Single public method execute() (lint). Queries never call a write repository or save().
 *          Clamp untrusted sizes here as well as in the HTTP schema (defense in depth).
 */
import type { IGreetingListItem, IGreetingReadRepository } from '../../../domain/interfaces/IGreetingReadRepository';
import type { IUserListItem, IUserReadRepository } from '../../../domain/interfaces/IUserReadRepository';

export interface IGetHelloQuery {
  limit: number;
}

export interface IHelloView {
  message: string;
  users: IUserListItem[];
  greetings: IGreetingListItem[];
}

const MAX_LIMIT = 50;

export class GetHelloUseCase {
  constructor(
    private readonly userReads: IUserReadRepository,
    private readonly greetingReads: IGreetingReadRepository,
  ) {}

  async execute(query: IGetHelloQuery): Promise<IHelloView> {
    const limit = Math.min(Math.max(Math.trunc(query.limit), 1), MAX_LIMIT);
    const [users, greetings] = await Promise.all([this.userReads.listRecent(limit), this.greetingReads.listRecent(limit)]);
    return { message: 'hello', users, greetings };
  }
}
