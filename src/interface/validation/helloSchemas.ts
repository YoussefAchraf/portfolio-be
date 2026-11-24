/**
 * LAYER    interface/validation
 * ROLE     zod schemas for the HTTP input of one feature (file = <feature>Schemas.ts, constant =
 *          <action><Part>Schema). They mirror the exported OpenAPI (src/docs/helloDocs.ts).
 * RULES    Shape, types, coercion, defaults and bounds only - business rules live in the domain
 *          (Greeting.create re-checks the name). Export the inferred type next to the schema.
 */
import { z } from 'zod';

export const showHelloQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type ShowHelloQuery = z.infer<typeof showHelloQuerySchema>;

export const createHelloBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
});
export type CreateHelloBody = z.infer<typeof createHelloBodySchema>;
