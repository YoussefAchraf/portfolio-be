# syntax=docker/dockerfile:1
#
# Stages
#   deps       install all dependencies (works with or without package-lock.json)
#   dev        hot-reload image for compose profile "dev" (npm run dev)
#   build      prisma generate + tsc -> dist/ ; also used by the compose "migrate" service
#   prod-deps  production-only node_modules
#   runtime    minimal non-root image. docker/entrypoint.sh applies migrations (prisma migrate deploy,
#              MIGRATE_ON_START=false skips) then execs node dist/server.js (SEED_DEMO_DATA=true seeds demo
#              users). No process manager: the container runtime restarts the process.

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package.json package-lock.json* ./
# npm runs the "prepare" script (git hook installer; a no-op without .git) - it must exist in the image.
COPY scripts/git-hooks.mjs ./scripts/
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi \
    && apk del .build-deps

FROM deps AS dev
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM deps AS build
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package.json package-lock.json* ./
# npm runs the "prepare" script (git hook installer; a no-op without .git) - it must exist in the image.
COPY scripts/git-hooks.mjs ./scripts/
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && apk del .build-deps

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
              /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod 0755 ./docker/entrypoint.sh
USER node
EXPOSE 4000
# Liveness only. Orchestrators should probe /ready for readiness (Postgres + Redis).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||4000,path:'/health',timeout:4000},res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT ["./docker/entrypoint.sh"]
