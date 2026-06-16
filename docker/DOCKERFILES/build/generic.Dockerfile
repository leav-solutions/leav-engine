# This Dockerfile is meant to build all services of LEAV-Engine, except the core.
# The build is pretty much the same for every services,
#
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.
# Exceptions for preview-generator are handled by the "target" feature of buildkit.
# More info here: https://docs.docker.com/build/building/multi-stage/#differences-between-legacy-builder-and-buildkit

# Create base builder
FROM node:24.16.0-alpine3.24 AS builder
ARG APP
WORKDIR /build

# Copy required files for builds
COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml ./
COPY apps/ ./apps
COPY libs/ ./libs

# Install dev module to build app
RUN yarn workspaces focus $APP && \
    yarn workspace $APP build && \
    apk --no-cache --update add rsync

WORKDIR /install

# Copy only production files for $APP and its dependencies
# We use rsync to be able to include/exclude files and folders easily
# And install only production dependencies for $APP
RUN rsync -av \
    --exclude=".yarn/cache" \
    --exclude="vite-config-*.js" \
    --exclude="babel.config.json" \
    --exclude="tsconfig.json" \
    --exclude="node_modules/" \
    --include="package.json" \
    --include="apps/$APP/dist/" \
    --include="apps/$APP/src/" \
    --include="apps/$APP/profile/" \
    --include="apps/$APP/config/" \
    --include="apps/$APP/guides/" \
    --include="apps/$APP/package.json" \
    --include="apps/$APP/" \
    --exclude="apps/$APP/*" \
    --exclude="apps/*/" \
    --exclude="libs/ui/" \
    --exclude="libs/core-types/" \
    --include="libs/*/" \
    --include="libs/*/dist/" \
    --include="libs/*/src/" \
    --include="libs/*/package.json" \
    --exclude="libs/*/*" \
    /build/ /install/ && \
    yarn config set cacheFolder /build/.yarn/cache && \
    yarn workspaces focus $APP --production && \
    rm -rf .yarn yarn.lock .yarnrc.yml

# Shared runtime base. Not a build target on its own: the actual final images are
# `runner` and `runner-preview-generator` below. Kept separate so apk can be purged
# per leaf (preview-generator still needs apk to install its extra libs).
FROM node:24.16.0-alpine3.24 AS runner-base
ARG APP
WORKDIR /app

COPY --from=builder /install ./

# Get ready for runtime
WORKDIR /app/apps/$APP
ENV APP_ROOT_PATH=/app/apps/$APP
# To avoid error at startup, since https://github.com/yarnpkg/yarn/releases/tag/v1.22.21
# error This project's package.json defines "packageManager": "yarn@4.0.2". However the current global version of Yarn is 1.22.22.
ENV SKIP_YARN_COREPACK_CHECK=1

CMD ["yarn", "run",  "start"]

### RUNNER FOR MOST APPS (automate-scan, sync-scan, mcp-runtime…) ###
FROM runner-base AS runner

# Security scan: remove forbidden tooling from the final image.
# apk (apk-tools) is purged last so the `apk add` step above still works.
# lsof and vi are busybox applets — we only drop the symlinks, busybox stays.
RUN rm -f /usr/bin/lsof /usr/bin/vi /sbin/apk \
    && rm -rf /etc/apk /lib/apk /usr/share/apk /var/cache/apk

### RUNNER FOR PREVIEW-GENERATOR ###
# Branches from runner-base (not runner) so apk is still available for the installs below.
FROM runner-base AS runner-preview-generator
## Install libs required for previews generation

# imagemagick is used to convert images
# ffmpeg is used to convert videos
# inkscape is used to convert svg
# ghostscript is by imagemagick for pdf detection/conversion
# libreoffice and unoconv are used to convert documents
RUN apk add --update --no-cache imagemagick~=7.1 ffmpeg inkscape ghostscript

ENV UNO_URL=https://raw.githubusercontent.com/dagwieers/unoconv/master/unoconv

# Install unoconv
RUN apk --no-cache add \
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
    # for unoconv
    py3-setuptools \
    && curl -Ls $UNO_URL -o /usr/local/bin/unoconv \
    && chmod +x /usr/local/bin/unoconv \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && apk del curl \
    && rm -rf /var/cache/apk/*

# Security scan: remove forbidden tooling from the final image.
# apk (apk-tools) is purged last so the `apk add` step above still works.
# lsof and vi are busybox applets — we only drop the symlinks, busybox stays.
RUN rm -f /usr/bin/lsof /usr/bin/vi /sbin/apk \
    && rm -rf /etc/apk /lib/apk /usr/share/apk /var/cache/apk
