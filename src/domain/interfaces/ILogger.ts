/**
 * LAYER    domain/interfaces (PORT - cross-cutting concern)
 * ROLE     Structured logging without a logging library. Implemented by infrastructure/services/PinoLogger.ts.
 * RULES    Message = stable event name ("user.created"), context = small object. Never log secrets,
 *          tokens, passwords, cookies or raw PII (emails): log ids instead.
 */
export type LogContext = Record<string, unknown>;

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}
