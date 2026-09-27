# syntax=docker/dockerfile:1
FROM ghcr.io/astral-sh/uv:0.10.6 AS uv
FROM python:3.13-slim AS api

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app
COPY --from=uv /uv /uvx /bin/
COPY . .
RUN uv sync --frozen --no-dev --package agent-api

EXPOSE 8000
CMD ["agent-api"]

FROM node:22-slim AS web-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY products/knowledge/apps/web/package.json products/knowledge/apps/web/package.json
COPY products/agent/apps/web/package.json products/agent/apps/web/package.json
RUN npm ci
COPY products/agent/apps/web products/agent/apps/web
COPY products/knowledge/apps/web/lib/local-users.ts products/knowledge/apps/web/lib/local-users.ts
RUN npm run build:app --workspace @ai-ecosystem/agent-web

FROM node:22-slim AS web
ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production
WORKDIR /app
COPY --from=web-build /app/products/agent/apps/web/.next/standalone ./
COPY --from=web-build /app/products/agent/apps/web/.next/static ./products/agent/apps/web/.next/static
EXPOSE 3000
CMD ["node", "products/agent/apps/web/server.js"]
