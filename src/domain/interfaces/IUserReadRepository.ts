/**
 * LAYER    domain/interfaces (PORT - read side of CQRS)
 * ROLE     What QUERY use cases need: ready-to-show read models, shaped for the screen, fetched in one
 *          optimized query. No entity, no invariants - reads never change state.
 * PATTERN  Pragmatic CQRS (single database): commands -> IUserRepository + entities;
 *          queries -> this port + read DTOs. Implemented by infrastructure/repositories/PgUserReadRepository.ts.
 * RULES    Read models are plain readonly data (I<Thing>ListItem, I<Thing>Details). Select only the
 *          columns the read model needs - never passwordHash. Always bound list sizes (limit).
 */
import type { Role, UserStatus } from '../constants/roles';

export interface IUserListItem {
  readonly id: string;
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly roleName: Role;
  readonly status: UserStatus;
  readonly createdAt: Date;
}

export interface IUserReadRepository {
  /** Newest first, at most `limit` rows. */
  listRecent(limit: number): Promise<IUserListItem[]>;
}
