/** LAYER interface/validation - validates the public profile locale. */
import { z } from 'zod';

export const showProfileQuerySchema = z.object({ lang: z.enum(['en', 'fr']).default('en') });
export type ShowProfileQuery = z.infer<typeof showProfileQuerySchema>;
