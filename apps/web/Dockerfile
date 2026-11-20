# Jōge's web app: the landing page, the rounds, agents, Sensei, the proof and status pages, and the API routes. Built
# from the repo root, because the app is one package of a pnpm workspace:
#
#   docker build -f apps/web/Dockerfile -t joge-web .
#
# Next's standalone output keeps the runtime image to the traced server files, one `node` process as PID 1.
FROM node:24.11.1-bookworm-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=1 NEXT_TELEMETRY_DISABLED=1
# SolidCash's SDK takes libauth from its author's fork by git commit (see pnpm-workspace.yaml), so the install needs git.
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@12.14.0
# pnpm 12's package layout is newer than the corepack bundled with Node 24, so the pinned pnpm comes from npm.
WORKDIR /repo

# Public settings, inlined into the browser bundle at build time. Never pass a secret this way: build arguments can be
# read from the image's history. Keys (database, auth, agents, model) are runtime variables only.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_JOGE_MAINNET_LIVE
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ARG NEXT_PUBLIC_REPO_URL
ARG NEXT_PUBLIC_CASHTOKENS_ADDRESS
ARG NEXT_PUBLIC_DOCS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_JOGE_MAINNET_LIVE=$NEXT_PUBLIC_JOGE_MAINNET_LIVE \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY \
    NEXT_PUBLIC_REPO_URL=$NEXT_PUBLIC_REPO_URL \
    NEXT_PUBLIC_CASHTOKENS_ADDRESS=$NEXT_PUBLIC_CASHTOKENS_ADDRESS \
    NEXT_PUBLIC_DOCS_URL=$NEXT_PUBLIC_DOCS_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/brain/package.json packages/brain/
COPY packages/chart/package.json packages/chart/
COPY packages/contracts/package.json packages/contracts/
COPY packages/db/package.json packages/db/
COPY packages/sdk/package.json packages/sdk/
COPY services/engine/package.json services/engine/
RUN --mount=type=cache,id=joge-pnpm-store-2,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@joge/web..."
COPY . .
# The build reads the database only at request time; a placeholder satisfies the server's env check while it builds.
# Each build gets its own deployment id, so a page left open across a redeploy reloads instead of asking for files
# the new build no longer has.
RUN --mount=type=cache,id=joge-next-cache,target=/repo/apps/web/.next/cache \
    NEXT_DEPLOYMENT_ID="build-$(date +%s)" \
    DATABASE_URL=postgres://build:build@localhost:5432/build pnpm --filter @joge/web build

FROM node:24.11.1-bookworm-slim
# Coolify's health check runs curl; the slim image ships without it.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
# The share image reads its fonts from disk at request time (server.js runs from apps/web).
COPY --from=build --chown=node:node /repo/apps/web/src/fonts/og ./apps/web/src/fonts/og
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/web/server.js"]
