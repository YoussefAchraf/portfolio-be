/**
 * LAYER    domain/interfaces (PORT - read side of CQRS)
 * ROLE     What queries need: the most recent greetings as plain read models. Implemented by
 *          PgGreetingReadRepository.
 */
export interface IGreetingListItem {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
}

export interface IGreetingReadRepository {
  /** Newest first, at most `limit` rows. */
  listRecent(limit: number): Promise<IGreetingListItem[]>;
}
