# Jōge docs: the static export, served by nginx. Build from this folder:
#   docker build -t joge-docs .
FROM node:24.11.1-bookworm-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /docs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts
COPY . .
# Where the app and the docs are served (links, previews), and the BLAZE banner's CashTokens address.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DOCS_URL
ARG NEXT_PUBLIC_CASHTOKENS_ADDRESS
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_DOCS_URL=$NEXT_PUBLIC_DOCS_URL \
    NEXT_PUBLIC_CASHTOKENS_ADDRESS=$NEXT_PUBLIC_CASHTOKENS_ADDRESS
RUN pnpm build

FROM nginx:1.27.5-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /docs/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
