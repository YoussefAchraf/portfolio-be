/**
 * LAYER    interface/middlewares
 * ROLE     The ONE place that turns errors into HTTP responses: { error, code, details? }
 *          (contracts/conventions.md section 2). Mounted LAST in app.ts.
 * RULES    AppError -> its status/code/details. Malformed JSON -> 400 VALIDATION_FAILED. Anything else is a
 *          bug or an outage: log it with the request context, answer a generic 500 INTERNAL_ERROR
 *          and never leak the message or stack. Express 5 forwards rejected async handlers here.
 */
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { ERROR_CODES } from '../../domain/errors/errorCodes';
import type { ILogger } from '../../domain/interfaces/ILogger';

function isMalformedJson(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { type?: string }).type === 'entity.parse.failed';
}

export function errorHandlerMiddleware(deps: { logger: ILogger }): ErrorRequestHandler {
  return (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message, code: error.code, ...(error.details ? { details: error.details } : {}) });
      return;
    }
    if (isMalformedJson(error)) {
      res.status(400).json({ error: 'Malformed JSON body', code: ERROR_CODES.VALIDATION_FAILED });
      return;
    }
    deps.logger.error('request.failed', {
      method: req.method,
      path: req.path,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
    });
    res.status(500).json({ error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR });
  };
}
