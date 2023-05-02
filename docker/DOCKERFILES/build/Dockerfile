# This Dockerfile is meant to build all services of LEAV-Engine. The build is pretty much the same for every services,
# except for the core, which needs the source code of all front apps and the preview-generator which needs some
# extra dependencies for documents processing.
#
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.
# Exception for core and preview-generator are handled by the "target" feature of buildkit.
# More info here: https://docs.docker.com/build/building/multi-stage/#differences-between-legacy-builder-and-buildkit

### BASE ###
FROM node:18-alpine AS base

# The name of the service we are building (core, automate-scan, ...)
ARG APP

WORKDIR /app

# Copy required files for builds
COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml vite-config-common.js ./
COPY apps/ ./apps
COPY libs/ ./libs/
COPY assets/ ./assets

### BUILDER ###
FROM base AS builder
ARG APP

# Install dev modules, needed for build
RUN yarn workspaces focus $APP

# Build project
RUN yarn workspace $APP build

### RUNNER ###
FROM base as runner
ARG APP

# Retrieve code
COPY --from=builder /app/apps/$APP/dist ./apps/$APP/dist/

# Install production only modules
RUN yarn workspaces focus $APP --production

RUN rm -rf ./apps/$APP/src
RUN rm -rf .yarn/cache

COPY ./docker/scripts ./scripts
COPY libs ./libs
COPY assets ./assets

# Get ready for runtime
WORKDIR /app/apps/$APP
ENV APP_ROOT_PATH=/app/apps/$APP
CMD yarn run start

### RUNNER FOR CORE ###
FROM runner as runner-core
WORKDIR /app

COPY scripts/apps_install.sh ./scripts/apps_install.sh
RUN ./scripts/apps_install.sh

RUN rm -rf ./apps/login
RUN rm -rf ./apps/admin
RUN rm -rf  ./apps/data-studio
RUN rm -rf  ./apps/portal

WORKDIR /app/apps/core

### RUNNER FOR PREVIEW-GENERATOR ###
FROM runner as runner-preview-generator
## Install libs required for previews generation

# imagemagick is used to convert images
# ffmpeg is used to convert videos
# inkscape is used to convert svg
# libreoffice and unoconv are used to convert documents
RUN apk update
RUN apk add --no-cache imagemagick~=7.1 ffmpeg inkscape

ENV UNO_URL https://raw.githubusercontent.com/dagwieers/unoconv/master/unoconv

# Install unoconv
RUN apk --no-cache add bash mc openjdk8 \
    curl \
    util-linux \
    libreoffice-common \
    libreoffice-base \
    libreoffice-connector-postgres \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-draw \
    libreoffice-impress \
    libreoffice-math \
    libreofficekit \
    font-droid-nonlatin \
    font-droid \
    ttf-dejavu \
    ttf-freefont \
    ttf-liberation \
    && curl -Ls $UNO_URL -o /usr/local/bin/unoconv \
    && chmod +x /usr/local/bin/unoconv \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && apk del curl \
    && rm -rf /var/cache/apk/*