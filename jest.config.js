/**
 * Jest config.
 * - ts-jest compiles with tsconfig.eslint.json (rootDir ".") because tests/ lives outside
 *   src/, and tsconfig.json's rootDir "src" would reject it.
 * - Test layout and naming: see tests/README.md.
 */
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // With moduleResolution "nodenext", the generated Prisma client imports its own files as "./x.js";
  // resolve such relative imports to the .ts source (a real .js file still resolves through the extensions).
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.eslint.json' }],
  },
  passWithNoTests: true,
};
