/**
 * LAYER    interface/middlewares
 * ROLE     Validates the SHAPE of untrusted input (body / params / query) with zod before any controller
 *          runs. Failure = 422 VALIDATION_FAILED with details.fields (field -> i18n key) per the contract.
 * PATTERN  Middleware factory: validate({ query: helloQuerySchema }). Parsed (typed, coerced, defaulted)
 *          values go to res.locals.validated - Express 5 req.query is a read-only getter.
 * RULES    Shape checks here; BUSINESS rules stay in entities/use cases. Controllers read input only
 *          through validatedInput(res), never from raw req.body/req.query.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { AppError } from '../../domain/errors/AppError';

type RequestPart = 'body' | 'params' | 'query';
type ISchemas = Partial<Record<RequestPart, z.ZodType>>;

export function validate(schemas: ISchemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validated: Partial<Record<RequestPart, unknown>> = {};
    const fields: Record<string, string> = {};
    for (const part of Object.keys(schemas) as RequestPart[]) {
      const result = schemas[part]?.safeParse(req[part] ?? {});
      if (!result) continue;
      if (result.success) {
        validated[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          fields[issue.path.join('.') || part] = `validation.${issue.code}`;
        }
      }
    }
    if (Object.keys(fields).length > 0) {
      next(AppError.validation(fields));
      return;
    }
    res.locals['validated'] = validated;
    next();
  };
}

/** Typed access to what validate() stored. TInput is the zod output type of that schema. */
export function validatedInput<TInput>(res: Response, part: RequestPart): TInput {
  const validated = res.locals['validated'] as Partial<Record<RequestPart, unknown>> | undefined;
  return validated?.[part] as TInput;
}
