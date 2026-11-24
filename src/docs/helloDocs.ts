/**
 * LAYER    docs
 * ROLE     OpenAPI fragment for one feature (<feature>Docs.ts -> <feature>Paths), merged by
 *          swaggerDefinition.ts and exported to docs/openapi.json (npm run docs:export). CI fails when the
 *          committed docs/openapi.json is stale; the manager compares it with contracts/openapi/<feature>.yaml.
 * RULES    Must describe exactly what the routes + presenter return. Real features copy their shapes
 *          from the workspace contract, never invent them.
 */
export const helloPaths = {
  '/hello': {
    get: {
      operationId: 'showHello',
      summary: 'Boilerplate demo: greeting plus the most recent users read from the database',
      tags: ['hello'],
      parameters: [
        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
      ],
      responses: {
        '200': {
          description: 'Greeting and users (newest first)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HelloResponse' } } },
        },
        '422': { $ref: '#/components/responses/ValidationFailed' },
      },
    },
    post: {
      operationId: 'createHello',
      summary: 'Boilerplate demo: store a greeting for the given name and answer "hello <name>"',
      tags: ['hello'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateHelloRequest' } } },
      },
      responses: {
        '201': {
          description: 'Greeting stored',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SaidHelloResponse' } } },
        },
        '400': { $ref: '#/components/responses/ValidationFailed' },
        '422': { $ref: '#/components/responses/ValidationFailed' },
      },
    },
  },
} as const;

export const helloSchemas = {
  User: {
    type: 'object',
    required: ['id', 'email', 'firstname', 'lastname', 'roleName', 'status', 'createdAt'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      firstname: { type: 'string' },
      lastname: { type: 'string' },
      roleName: { type: 'string', enum: ['admin', 'member'] },
      status: { type: 'string', enum: ['active', 'disabled'] },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Greeting: {
    type: 'object',
    required: ['id', 'name', 'createdAt'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1, maxLength: 60 },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  HelloResponse: {
    type: 'object',
    required: ['message', 'users', 'greetings'],
    properties: {
      message: { type: 'string', example: 'hello' },
      users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
      greetings: { type: 'array', items: { $ref: '#/components/schemas/Greeting' } },
    },
  },
  CreateHelloRequest: {
    type: 'object',
    required: ['name'],
    properties: { name: { type: 'string', minLength: 1, maxLength: 60, example: 'Ada' } },
  },
  SaidHelloResponse: {
    type: 'object',
    required: ['message', 'greeting'],
    properties: {
      message: { type: 'string', example: 'hello Ada' },
      greeting: { $ref: '#/components/schemas/Greeting' },
    },
  },
} as const;
