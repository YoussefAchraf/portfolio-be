/**
 * LAYER    interface/controllers
 * ROLE     Thin HTTP adapter for one feature: read validated input -> call ONE use case -> present -> send.
 * PATTERN  Controller with injected use cases (constructor). Methods named by intent: list, show, create,
 *          update, remove (+ action verbs) - never getX/postX (lint).
 * RULES    No business logic, no database, no try/catch for expected errors (AppError reaches the global
 *          handler; Express 5 forwards async rejections). Status codes and headers are decided HERE.
 */
import type { Request, Response } from 'express';
import type { SayHelloUseCase } from '../../use-cases/hello/commands/SayHelloUseCase';
import type { GetHelloUseCase } from '../../use-cases/hello/queries/GetHelloUseCase';
import { validatedInput } from '../middlewares/validateRequestMiddleware';
import { presentSaidHello } from '../presenters/GreetingPresenter';
import { presentHello } from '../presenters/HelloPresenter';
import type { CreateHelloBody, ShowHelloQuery } from '../validation/helloSchemas';

export class HelloController {
  constructor(
    private readonly getHello: GetHelloUseCase,
    private readonly sayHello: SayHelloUseCase,
  ) {}

  async show(_req: Request, res: Response): Promise<void> {
    const { limit } = validatedInput<ShowHelloQuery>(res, 'query');
    const view = await this.getHello.execute({ limit });
    res.status(200).json(presentHello(view));
  }

  async create(_req: Request, res: Response): Promise<void> {
    const { name } = validatedInput<CreateHelloBody>(res, 'body');
    const greeting = await this.sayHello.execute({ name });
    res.status(201).json(presentSaidHello(greeting));
  }
}
