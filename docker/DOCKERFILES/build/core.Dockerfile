# This Dockerfile is meant to build the core of LEAV-Engine.
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.

# Create base builder
FROM node:24.18.0-alpine3.24 AS builder
WORKDIR /build

# Copy required files for builds
COPY .yarn ./.yarn
COPY *.json yarn.lock .yarnrc.yml vite-config-common.js ./
COPY apps/ ./apps
COPY libs/ ./libs

# Increase Node.js memory limit to avoid build failures for app-studio on new docker-build gitlab-runner
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dev modules to build core and fronts
RUN yarn install && \
    yarn workspace core build && \
    yarn run fronts:build:install && \
    apk --no-cache --update add rsync

WORKDIR /install

# Copy only production files for core and its dependencies
# We use rsync to be able to include/exclude files and folders easily
# And install only production dependencies for core
RUN rsync -av \
    --exclude=".yarn/cache" \
    --exclude="vite-config-*.js" \
    --exclude="babel.config.json" \
    --exclude="tsconfig.json" \
    --exclude="node_modules/" \
    --include="package.json" \
    --include="apps/core/dist/" \
    --include="apps/core/src/" \
    --include="apps/core/applications/" \
    --include="apps/core/config/" \
    --include="apps/core/package.json" \
    --include="apps/core/" \
    --exclude="apps/core/*" \
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
    yarn workspaces focus core --production && \
    rm -rf .yarn yarn.lock .yarnrc.yml

### RUNNER FOR CORE ###
FROM node:24.18.0-alpine3.24 AS runner
WORKDIR /app

COPY --from=builder /install ./
COPY assets/ ./assets

# Dependencies needed to retrieve files metadata with exiftool-vendored pkg
RUN apk --update --no-cache add perl pkgconfig

# Security scan: remove forbidden tooling from the final image.
# apk (apk-tools) is purged last so the `apk add` step above still works.
# lsof and vi are busybox applets — we only drop the symlinks, busybox stays.
RUN rm -f /usr/bin/lsof /usr/bin/vi /sbin/apk \
    && rm -rf /etc/apk /lib/apk /usr/share/apk /var/cache/apk

# Get ready for runtime
WORKDIR /app/apps/core
ENV APP_ROOT_PATH=/app/apps/core
# To avoid error at startup, since https://github.com/yarnpkg/yarn/releases/tag/v1.22.21
# error This project's package.json defines "packageManager": "yarn@4.0.2". However the current global version of Yarn is 1.22.22.
ENV SKIP_YARN_COREPACK_CHECK=1

# Useful for e2e playwright tests to run that service in gitlab-ci
EXPOSE 4001

CMD ["sh", "-c", "yarn run db:migrate && yarn run start"]
