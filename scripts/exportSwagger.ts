/**
 * SCRIPT   npm run docs:export
 * ROLE     Writes the OpenAPI spec to docs/openapi.json (committed, diffed, checked by the CI
 *          "openapi drift" job and by npm run docs:check against feature pages).
 * RULES    Deterministic output: 2-space JSON + trailing newline. Run it whenever routes change.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { swaggerSpec } from '../src/docs/swaggerDefinition';

const target = join(__dirname, '..', 'docs', 'openapi.json');
mkdirSync(join(__dirname, '..', 'docs'), { recursive: true });
writeFileSync(target, `${JSON.stringify(swaggerSpec, null, 2)}\n`);
console.log('docs/openapi.json written');
