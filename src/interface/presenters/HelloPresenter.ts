/**
 * LAYER    interface/presenters
 * ROLE     Shapes the GetHelloUseCase view into the GET /v1/hello response. Reuses presentUser and
 *          presentGreeting so each whitelist is defined once.
 */
import { presentGreeting } from './GreetingPresenter';
import type { IGreetingResponse } from './GreetingPresenter';
import { presentUser } from './UserPresenter';
import type { IUserResponse } from './UserPresenter';
import type { IHelloView } from '../../use-cases/hello/queries/GetHelloUseCase';

export interface IHelloResponse {
  message: string;
  users: IUserResponse[];
  greetings: IGreetingResponse[];
}

export function presentHello(view: IHelloView): IHelloResponse {
  return { message: view.message, users: view.users.map(presentUser), greetings: view.greetings.map(presentGreeting) };
}
