/**
 * LAYER    interface/middlewares
 * ROLE     Any route no module handled -> 404 NOT_FOUND in the standard envelope. Mounted after all modules,
 *          right before the error handler.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../../domain/errors/AppError';

export function notFoundMiddleware(): RequestHandler {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next(AppError.notFound('Route'));
  };
}
