/**
 * LAYER    interface/presenters
 * ROLE     Public shape of a greeting (id, name, createdAt ISO) and of the POST /v1/hello answer.
 */
import type { Greeting } from '../../domain/entities/Greeting';
import type { IGreetingListItem } from '../../domain/interfaces/IGreetingReadRepository';

export interface IGreetingResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface ISaidHelloResponse {
  message: string;
  greeting: IGreetingResponse;
}

export function presentGreeting(greeting: IGreetingListItem): IGreetingResponse {
  return { id: greeting.id, name: greeting.name, createdAt: greeting.createdAt.toISOString() };
}

export function presentSaidHello(greeting: Greeting): ISaidHelloResponse {
  return { message: greeting.message, greeting: presentGreeting(greeting) };
}
