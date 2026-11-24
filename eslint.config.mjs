// ESLint 9 flat config for et-be.
//
// IMPORTANT (flat-config semantics): when two blocks match the same file and set the SAME
// rule, the later block REPLACES the earlier one; it does not merge. So every folder block
// below declares its COMPLETE list for `no-restricted-imports` / `no-restricted-syntax`,
// built from the shared IMPORT / SYNTAX pieces. Never add a partial block for those rules.

import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ---------------------------------------------------------------------------
// Architecture elements (eslint-plugin-boundaries)
// ---------------------------------------------------------------------------
// Element descriptors match FOLDERS (eslint-plugin-boundaries 7). Single files are classified with
// file descriptors (`boundariesFiles`) - verified against the installed 7.4.4 README and types.
const boundariesElements = [
  { type: 'composition-root', pattern: 'src/modules/**' },
  { type: 'config', pattern: 'src/config/**' },
  { type: 'docs', pattern: 'src/docs/**' },
  { type: 'interface', pattern: 'src/interface/**' },
  { type: 'use-cases', pattern: 'src/use-cases/**' },
  { type: 'infrastructure', pattern: 'src/infrastructure/**' },
  { type: 'domain', pattern: 'src/domain/**' },
  { type: 'generated', pattern: 'src/generated/**' },
];

const boundariesFiles = [{ pattern: 'src/{app,server}.ts', category: 'composition-root' }];

const COMPOSITION_TARGETS = ['composition-root', 'config', 'docs', 'domain', 'use-cases', 'infrastructure', 'interface'];

// ---------------------------------------------------------------------------
// Shared restriction pieces
// ---------------------------------------------------------------------------
const IMPORT = {
  express: { name: 'express', message: 'Express belongs to src/interface/ and the composition root only.' },
  prisma: { name: '@prisma/client', message: 'Prisma belongs to src/infrastructure/ only (import the generated client there).' },
  ioredis: { name: 'ioredis', message: 'Redis belongs to src/infrastructure/cache/ only (inject RedisClient elsewhere).' },
  socketIo: { name: 'socket.io', message: 'Socket.IO belongs to src/infrastructure/realtime/ only.' },
};

const SYNTAX = {
  useCaseClassName: {
    selector: 'ClassDeclaration[id.name]:not([id.name=/UseCase$/])',
    message: 'Use case classes must end with "UseCase" (LoginUseCase, CreateProjectUseCase...).',
  },
  useCaseSinglePublicMethod: {
    selector:
      "ClassBody > MethodDefinition[kind='method'][key.type='Identifier']:not([key.name='execute']):not([key.name=/^_/]):not([accessibility='private'])",
    message: 'Use cases expose a single public entry point: execute(). Helpers must be private or prefixed with _.',
  },
  repositoryInterfaceName: {
    selector: 'TSInterfaceDeclaration[id.name=/Repository$/]:not([id.name=/^I[A-Z][A-Za-z0-9]*Repository$/])',
    message: 'Repository contracts must be named I<Thing>Repository (IUserRepository).',
  },
  pgRepositoryName: {
    selector: 'ClassDeclaration[id.name=/Repository$/]:not([id.name=/^Pg[A-Z][A-Za-z0-9]*Repository$/])',
    message: 'Postgres repositories must be named Pg<Thing>Repository (PgUserRepository).',
  },
  serviceName: {
    selector: 'ClassDeclaration[id.name=/Service$/]:not([id.name=/^[A-Z][A-Za-z0-9]+Service$/])',
    message: 'Infrastructure services must be PascalCase and end with "Service" (TokenService).',
  },
  controllerName: {
    selector: 'ClassDeclaration[id.name=/Controller$/]:not([id.name=/^[A-Z][A-Za-z0-9]+Controller$/])',
    message: 'Controllers must be PascalCase and end with "Controller" (AuthController).',
  },
  controllerMethodNotHttpVerb: {
    selector: 'ClassBody > MethodDefinition[key.name=/^(get|post|put|patch|delete)[A-Z]/]',
    message: 'Name controller methods after intent (list, show, create, update, remove), never HTTP verbs.',
  },
  routeFactoryName: {
    selector: 'ExportNamedDeclaration > FunctionDeclaration[id.name]:not([id.name=/Routes$/])',
    message: 'Route factories must be named <feature>Routes and return an Express Router (authRoutes).',
  },
};

const banImports = (...paths) => ({ 'no-restricted-imports': ['error', { paths }] });
const banSyntax = (...items) => ({ 'no-restricted-syntax': ['error', ...items] });

const noProcessEnv = {
  'no-restricted-properties': [
    'error',
    {
      object: 'process',
      property: 'env',
      message: 'Read configuration through injected config objects built at the composition root, never process.env here.',
    },
  ],
};

const noConsole = { 'no-console': 'error' };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**', 'coverage/**', 'jest.config.js', 'src/generated/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Base rules for all TypeScript sources -----------------------------------
  {
    files: ['src/**/*.ts', 'scripts/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.eslint.json' } },
    },
    rules: {
      'import/no-cycle': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // Ban the ts-ignore directive; allow ts-expect-error only with a real explanation (>= 15 chars).
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 15 }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'no-console': 'error', // src/ logs through ILogger; tests/ and scripts/ re-enable console below
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'classProperty', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'classMethod', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'typeProperty', format: null },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        { selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index']],
          'newlines-between': 'ignore',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // domain/ -- pure business, zero frameworks -------------------------------
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      ...banImports(IMPORT.express, IMPORT.prisma, IMPORT.ioredis, IMPORT.socketIo),
      ...banSyntax(SYNTAX.repositoryInterfaceName),
      ...noProcessEnv,
      ...noConsole,
    },
  },

  // use-cases/ -- application logic, one class per action -------------------
  {
    files: ['src/use-cases/**/*.ts'],
    rules: {
      ...banImports(IMPORT.express, IMPORT.prisma, IMPORT.ioredis, IMPORT.socketIo),
      ...banSyntax(SYNTAX.useCaseClassName, SYNTAX.useCaseSinglePublicMethod),
      ...noProcessEnv,
      ...noConsole,
    },
  },

  // infrastructure/ -- adapters (most specific folders AFTER the general one) -
  {
    files: ['src/infrastructure/**/*.ts'],
    rules: {
      ...banImports(IMPORT.express, IMPORT.socketIo),
      ...banSyntax(SYNTAX.pgRepositoryName, SYNTAX.serviceName),
      ...noProcessEnv,
    },
  },
  {
    files: ['src/infrastructure/database/**/*.ts', 'src/infrastructure/repositories/**/*.ts'],
    rules: {
      ...banImports(IMPORT.express, IMPORT.socketIo, IMPORT.ioredis),
    },
  },
  {
    // Every class in repositories/ must be Pg<Thing>Repository (catches UserRepoImpl-style names).
    files: ['src/infrastructure/repositories/**/*.ts'],
    rules: {
      ...banSyntax({
        selector: 'ClassDeclaration[id.name]:not([id.name=/^Pg[A-Z][A-Za-z0-9]*Repository$/])',
        message: 'Classes in infrastructure/repositories must be named Pg<Thing>Repository (PgUserRepository).',
      }),
    },
  },
  {
    files: ['src/infrastructure/realtime/**/*.ts'],
    rules: {
      ...banImports(IMPORT.express),
    },
  },

  // interface/ -- HTTP delivery ----------------------------------------------
  {
    files: ['src/interface/**/*.ts'],
    rules: {
      ...banImports(IMPORT.prisma, IMPORT.ioredis, IMPORT.socketIo),
      ...banSyntax(SYNTAX.controllerName),
      ...noProcessEnv,
    },
  },
  {
    files: ['src/interface/routes/**/*.ts'],
    rules: {
      ...banSyntax(SYNTAX.controllerName, SYNTAX.routeFactoryName),
    },
  },
  {
    files: ['src/interface/controllers/**/*.ts'],
    rules: {
      ...banSyntax(SYNTAX.controllerName, SYNTAX.controllerMethodNotHttpVerb),
    },
  },

  // Layer dependency policy ---------------------------------------------------
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: { 'boundaries/elements': boundariesElements, 'boundaries/files': boundariesFiles },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: { element: { type: 'domain' } }, allow: { to: { element: { type: 'domain' } } } },
            { from: { element: { type: 'use-cases' } }, allow: { to: { element: { types: ['domain', 'use-cases'] } } } },
            {
              from: { element: { type: 'infrastructure' } },
              allow: { to: { element: { types: ['domain', 'infrastructure', 'generated'] } } },
            },
            {
              from: { element: { type: 'interface' } },
              allow: { to: { element: { types: ['domain', 'use-cases', 'interface'] } } },
            },
            { from: { element: { type: 'docs' } }, allow: { to: { element: { types: ['docs', 'domain'] } } } },
            { from: { element: { type: 'config' } }, allow: { to: { element: { type: 'config' } } } },
            { from: { element: { type: 'composition-root' } }, allow: { to: { element: { types: COMPOSITION_TARGETS } } } },
            { from: { file: { categories: 'composition-root' } }, allow: { to: { element: { types: COMPOSITION_TARGETS } } } },
            // server.ts -> app.ts (single files are not elements, so the element rule above does not cover it).
            { from: { file: { categories: 'composition-root' } }, allow: { to: { file: { categories: 'composition-root' } } } },
          ],
        },
      ],
    },
  },

  // tests/ and scripts/ -- relaxed -------------------------------------------
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  // Dependency-free Node scripts (docs generator) -----------------------------
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { sourceType: 'module', globals: globals.node },
  },
);
