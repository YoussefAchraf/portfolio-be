/**
 * LAYER    domain/errors
 * ROLE     The public error-code catalog. Mirrors contracts/conventions.md section 2 exactly; the
 *          frontend mirrors it too (rt-fe/src/shared/types/errorCodes.ts), so a code is a contract.
 * RULES    Add a code in contracts/conventions.md FIRST (manager), then here, in the same round.
 *          Never rename or remove a code without a contract amendment.
 */
export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  CSRF_INVALID: 'CSRF_INVALID',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
