/**
 * LAYER    infrastructure/services (ADAPTER)
 * ROLE     Implements ILogger with pino (JSON lines on stdout - the container runtime collects them).
 * RULES    The only file that imports pino. Redaction is configured here so a careless context object
 *          still cannot print secrets.
 */
import pino from 'pino';
import type { ILogger, LogContext } from '../../domain/interfaces/ILogger';

const REDACT = ['password', 'passwordHash', '*.password', '*.passwordHash', 'authorization', 'cookie', '*.token'];

export class PinoLogger implements ILogger {
  private readonly pino: pino.Logger;

  constructor(options: { level: string }) {
    this.pino = pino({ level: options.level, redact: { paths: REDACT, censor: '[redacted]' } });
  }

  debug(message: string, context?: LogContext): void {
    this.pino.debug(context ?? {}, message);
  }
  info(message: string, context?: LogContext): void {
    this.pino.info(context ?? {}, message);
  }
  warn(message: string, context?: LogContext): void {
    this.pino.warn(context ?? {}, message);
  }
  error(message: string, context?: LogContext): void {
    this.pino.error(context ?? {}, message);
  }
}
