# This Dockerfile is meant to build the core of LEAV-Engine.
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.

### CORE BUILDER ###
FROM node:18-alpine3.18 AS builder
WORKDIR /app
ENV YARN_ENABLE_INLINE_BUILDS=1

# Dependencies needed to retrieve metadata
RUN apk --update --no-cache add alpine-sdk perl pkgconfig poppler poppler-dev poppler-utils python3

# Copy required files for builds
COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml vite-config-common.js ./
COPY apps/ ./apps
COPY libs/ ./libs
COPY assets/ ./assets
COPY apps/core/package.json ./apps/core/
COPY docker/scripts ./scripts
COPY scripts/apps_install.sh ./scripts/apps_install.sh

# Install dev modules, needed for build and build project
RUN yarn workspaces focus core && yarn workspace core build
# Install apps
RUN ./scripts/apps_install.sh

### PROD DEPENDENCIES INSTALL ###
FROM node:18-alpine3.18 AS prod-dep-install
WORKDIR /app

COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml ./
COPY libs/ ./libs
COPY assets/ ./assets
COPY docker/scripts ./scripts
COPY apps/core/package.json ./apps/core/
COPY apps/core/config ./apps/core/config

COPY --from=builder /app/apps/core/dist ./apps/core/dist
COPY --from=builder /app/apps/core/applications ./apps/core/applications

RUN yarn workspaces focus core --production && rm -rf .yarn yarn.lock .yarnrc.yml

### RUNNER FOR CORE ###
FROM node:18-alpine3.18 AS final
WORKDIR /app

COPY --from=prod-dep-install app/ ./
RUN npm install -g nodemon

# Get ready for runtime
WORKDIR /app/apps/core
ENV APP_ROOT_PATH=/app/apps/core

CMD ["sh", "-c", "/app/scripts/plugins_install.sh && npm run db:migrate && npm run watch-dev"]
