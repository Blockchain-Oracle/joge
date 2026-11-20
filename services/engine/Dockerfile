# Jōge's engine for one world (JOGE_NETWORK=mainnet or chipnet): the oracle relay, the live price line, the indexer,
# the keeper, the agents' runner, round alerts and the replays' price paths. It runs its TypeScript directly (Node's
# type stripping), so there is no build step; it applies the database migrations when it starts.
#
#   docker build -f services/engine/Dockerfile -t joge-engine .
FROM node:24.11.1-bookworm-slim
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=1 NODE_ENV=production
# SolidCash's SDK takes libauth from its author's fork by git commit (see pnpm-workspace.yaml), so the install needs git.
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@12.14.0
# pnpm 12's package layout is newer than the corepack bundled with Node 24, so the pinned pnpm comes from npm.
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/engine/package.json services/engine/
COPY packages/brain/package.json packages/brain/
COPY packages/contracts/package.json packages/contracts/
COPY packages/db/package.json packages/db/
COPY packages/sdk/package.json packages/sdk/
COPY packages/chart/package.json packages/chart/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=joge-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter "@joge/engine..."
COPY packages ./packages
COPY services/engine ./services/engine
USER node
WORKDIR /repo/services/engine
CMD ["node", "src/main.ts"]
