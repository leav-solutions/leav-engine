# This Dockerfile is meant to build the core of LEAV-Engine.
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.

### BASE ###
FROM node:18-alpine AS base

WORKDIR /app

ENV YARN_ENABLE_INLINE_BUILDS=1

# Copy required files for builds
COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml vite-config-common.js ./
COPY apps/ ./apps
COPY libs/ ./libs/
COPY assets/ ./assets

# Dependencies needed to retrieve metadata
RUN apk --update --no-cache add alpine-sdk perl pkgconfig poppler=23.05.0 poppler-dev=23.05.0 poppler-utils=23.05.0 python3

### BUILDER ###
FROM base AS builder

# Install dev modules, needed for build and build project
RUN yarn workspaces focus core && yarn workspace core build

### RUNNER ###
FROM base as runner

# Retrieve code
COPY --from=builder /app/apps/core/dist ./apps/core/dist/

# Install production only modules
RUN yarn workspaces focus core --production

COPY ./docker/scripts ./scripts
COPY libs ./libs
COPY assets ./assets

# Get ready for runtime
WORKDIR /app/apps/core
ENV APP_ROOT_PATH=/app/apps/core
CMD ["yarn", "run",  "start"]

### APPS INSTALLER FOR CORE ###
# Install apps for core in a specific stage to avoid having all node_modules in runner-core
FROM runner as apps-installer-core
WORKDIR /app

# Install apps
COPY scripts/apps_install.sh ./scripts/apps_install.sh
RUN ./scripts/apps_install.sh


### RUNNER FOR CORE ###
FROM runner as runner-core
WORKDIR /app

COPY --from=apps-installer-core /app/apps/core/applications ./apps/core/applications

RUN rm -rf ./apps/login \
    && rm -rf ./apps/admin \
    && rm -rf ./apps/data-studio \
    && rm -rf ./apps/portal \
    && rm -rf ./apps/preview-generator/src \
    && rm -rf ./apps/automate-scan/src \
    && rm -rf ./apps/sync-scan/src \
    && rm -rf ./apps/core/src \
    && rm -rf .yarn/cache \
    && apk del alpine-sdk pkgconfig poppler-dev poppler-utils python3

WORKDIR /app/apps/core
