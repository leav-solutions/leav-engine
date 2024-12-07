# This Dockerfile is meant to build the core of LEAV-Engine with a watch on plugin to allow hot reload when plugin changes
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.

### CORE BUILDER ###
FROM node:18-alpine3.18 AS builder
WORKDIR /app
ENV YARN_ENABLE_INLINE_BUILDS=1

# Dependencies needed to retrieve metadata
RUN apk --update add perl pkgconfig

# Copy required files for builds
COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml vite-config-common.js ./
COPY apps/ ./apps
COPY libs/ ./libs
COPY assets/ ./assets
COPY apps/core/package.json ./apps/core/
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
COPY apps/core/package.json ./apps/core/

RUN yarn workspaces focus core --production && rm -rf .yarn yarn.lock .yarnrc.yml

### RUNNER FOR CORE ###
FROM node:18-alpine3.18 AS runner
WORKDIR /app

COPY docker/scripts ./scripts
COPY apps/core/config ./apps/core/config
COPY --from=prod-dep-install app/ ./
COPY --from=builder /app/apps/core/applications ./apps/core/applications
COPY --from=builder /app/apps/core/dist ./apps/core/dist

RUN npm install -g nodemon@^3.1.7

# Get ready for runtime
WORKDIR /app/apps/core
ENV APP_ROOT_PATH=/app/apps/core

CMD ["sh", "-c", "/app/scripts/plugins_install.sh && yarn run db:migrate && yarn run watch-dev"]
