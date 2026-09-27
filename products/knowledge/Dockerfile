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
RUN uv sync --frozen --no-dev --package knowledge-api

EXPOSE 8000
CMD ["knowledge-api"]

FROM node:22-slim AS web-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/brand/package.json packages/brand/package.json
COPY products/knowledge/apps/web/package.json products/knowledge/apps/web/package.json
COPY products/agent/apps/web/package.json products/agent/apps/web/package.json
RUN npm ci
COPY packages/brand packages/brand
COPY products/knowledge/apps/web products/knowledge/apps/web
RUN npm run build:app --workspace @ai-ecosystem/knowledge-web

FROM node:22-slim AS web
ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production
WORKDIR /app
COPY --from=web-build /app/products/knowledge/apps/web/.next/standalone ./
COPY --from=web-build /app/products/knowledge/apps/web/.next/static ./products/knowledge/apps/web/.next/static
EXPOSE 3000
CMD ["node", "products/knowledge/apps/web/server.js"]
