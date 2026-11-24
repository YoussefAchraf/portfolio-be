/**
 * LAYER    docs
 * ROLE     The whole OpenAPI document: shared components (error envelope) + every <feature>Docs fragment.
 * USED BY  scripts/exportSwagger.ts (writes docs/openapi.json).
 * RULES    Add one spread per feature. Keep it deterministic (plain objects, no dates) so the CI drift
 *          check only fails on real changes.
 */
import { helloPaths, helloSchemas } from './helloDocs';
import { profilePaths, profileSchemas } from './profileDocs';

const ERROR_CODE_VALUES = [
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'FORBIDDEN',
  'CSRF_INVALID',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
];

export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'et-be API', version: '1.0.0' },
  servers: [{ url: '/v1', description: 'Versioned API base path (same convention as contracts/openapi)' }],
  paths: {
    ...helloPaths,
    ...profilePaths,
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['error', 'code'],
        properties: {
          error: { type: 'string' },
          code: { type: 'string', enum: ERROR_CODE_VALUES },
          details: { type: 'object' },
        },
      },
      ...helloSchemas,
      ...profileSchemas,
    },
    responses: {
      ValidationFailed: {
        description: 'Request does not match the schema (code VALIDATION_FAILED, details.fields)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
} as const;
