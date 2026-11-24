/**
 * LAYER    use-cases/<feature>/commands  (CQRS: COMMAND)
 * ROLE     POST /v1/hello: someone types a name, we store it and answer "hello <name>". The full write
 *          path the frontend template exercises: form -> API -> this command -> entity -> Postgres.
 * PATTERN  Command use case: build the entity (it validates), persist via the write port, return the
 *          result the presenter needs. Ports injected; no HTTP, no Prisma.
 */
import { Greeting } from '../../../domain/entities/Greeting';
import type { IClock } from '../../../domain/interfaces/IClock';
import type { IGreetingRepository } from '../../../domain/interfaces/IGreetingRepository';
import type { IIdGenerator } from '../../../domain/interfaces/IIdGenerator';
import type { ILogger } from '../../../domain/interfaces/ILogger';

export interface ISayHelloCommand {
  name: string;
}

export class SayHelloUseCase {
  constructor(
    private readonly greetings: IGreetingRepository,
    private readonly clock: IClock,
    private readonly ids: IIdGenerator,
    private readonly logger: ILogger,
  ) {}

  async execute(command: ISayHelloCommand): Promise<Greeting> {
    const greeting = Greeting.create({ id: this.ids.next(), name: command.name, now: this.clock.now() });
    await this.greetings.save(greeting);
    this.logger.info('greeting.created', { greetingId: greeting.id });
    return greeting;
  }
}
