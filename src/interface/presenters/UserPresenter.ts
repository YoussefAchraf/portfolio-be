/**
 * LAYER    interface/presenters
 * ROLE     The WHITELIST of what a client may see about a user. Converts domain/read models into the
 *          contract's JSON shape (ISO dates, no internal fields).
 * PATTERN  Presenter: present<Thing>(model) -> I<Thing>Response. Controllers never res.json(entity).
 * RULES    Add a field here only when the contract has it. passwordHash and updatedAt are never public
 *          (contracts/domain-model.md "User"). Dates as ISO 8601 UTC strings.
 */
import type { Role, UserStatus } from '../../domain/constants/roles';
import type { IUserListItem } from '../../domain/interfaces/IUserReadRepository';

export interface IUserResponse {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  roleName: Role;
  status: UserStatus;
  createdAt: string;
}

export function presentUser(user: IUserListItem): IUserResponse {
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    roleName: user.roleName,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}
