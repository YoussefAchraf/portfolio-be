/**
 * LAYER    domain/errors
 * ROLE     The ONLY error type thrown on purpose anywhere in src/. The global error handler
 *          (interface/middlewares/errorHandlerMiddleware.ts) turns it into { error, code, details? }.
 * PATTERN  Single error model: code (from ERROR_CODES) + human message + HTTP status + optional details.
 * USED BY  entities (invariant violations), use cases (not found, conflict...), middlewares.
 * RULES    Never throw strings or plain Error for expected failures. Unexpected errors (bugs, DB down)
 *          are NOT wrapped: the handler answers them with a generic 500 INTERNAL_ERROR.
 */
import type { ErrorCode } from './errorCodes';
import { ERROR_CODES } from './errorCodes';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static validation(fields: Record<string, string>): AppError {
    return new AppError(ERROR_CODES.VALIDATION_FAILED, 'Validation failed', 422, { fields });
  }

  static notFound(what: string): AppError {
    return new AppError(ERROR_CODES.NOT_FOUND, `${what} not found`, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(ERROR_CODES.CONFLICT, message, 409);
  }
}
