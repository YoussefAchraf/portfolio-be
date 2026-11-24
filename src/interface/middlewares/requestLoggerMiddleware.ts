/**
 * LAYER    interface/middlewares
 * ROLE     One structured log line per request (method, path, status, duration) through ILogger.
 * RULES    Never log bodies, cookies, query strings or headers (PII, tokens). Probes (/health, /ready)
 *          log at debug to keep production logs quiet.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ILogger } from '../../domain/interfaces/ILogger';

export function requestLoggerMiddleware(deps: { logger: ILogger }): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      const context = { method: req.method, path: req.path, status: res.statusCode, durationMs: Math.round(durationMs) };
      if (req.path === '/health' || req.path === '/ready') deps.logger.debug('request.completed', context);
      else deps.logger.info('request.completed', context);
    });
    next();
  };
}
