# This Dockerfile is meant to build all services of LEAV-Engine, except the core.
# The build is pretty much the same for every services,
#
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.
# Exceptions for preview-generator are handled by the "target" feature of buildkit.
# More info here: https://docs.docker.com/build/building/multi-stage/#differences-between-legacy-builder-and-buildkit

# The stages are not cosmetic: they exist so Docker can cache. One rule to preserve: never copy
# sources before the `deps` stage, or every source change reinstalls the app's dependencies.

ARG NODE_IMAGE=node:24.19.0-alpine3.24

# rsync is used by the manifests and assemble stages. Installed once here so it is already in the
# cache of every stage that needs it — the runtime stages do not derive from this one.
FROM ${NODE_IMAGE} AS base
RUN apk --no-cache --update add rsync

# Keep only what the install reads. This stage is replayed on every source change, but its *output*
# is stable, so the install stage below stays cached as long as no package.json and no lockfile
# moves. `apps/*/scripts/` is required: apps/admin runs one of them in a postinstall.
FROM base AS manifests
WORKDIR /src
COPY . .
RUN rsync -am \
    --include='*/' \
    --include='package.json' \
    --include='yarn.lock' \
    --include='.yarnrc.yml' \
    --include='.yarn/releases/***' \
    --include='apps/*/scripts/***' \
    --exclude='*' \
    /src/ /manifests/

# Dev dependencies of $APP only — `yarn workspaces focus` installs what that workspace declares
# (plus its linked workspace libs), not the hoisted monorepo tree. This is what catches phantom
# dependencies, see the root CLAUDE.md.
# The cache mount targets the `cacheFolder` of .yarnrc.yml (project-local, since
# `enableGlobalCache: false`), so downloaded archives survive from one build to the next.
FROM base AS deps
ARG APP
WORKDIR /build
COPY --from=manifests /manifests/ ./
RUN --mount=type=cache,target=/build/.yarn/cache,sharing=locked \
    yarn workspaces focus $APP

# These apps only build their own sources plus the shared libs.
FROM deps AS build
ARG APP
COPY *.json ./
COPY libs/ ./libs
COPY apps/$APP ./apps/$APP
RUN yarn workspace $APP build

FROM build AS assemble
ARG APP
WORKDIR /install

# Copy only production files for $APP and its dependencies
# We use rsync to be able to include/exclude files and folders easily
# And install only production dependencies for $APP
RUN --mount=type=cache,target=/build/.yarn/cache,sharing=locked \
    rsync -am \
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

# Append the build metadata here rather than rewriting versions in the build context: mutating
# every package.json before `docker build` would invalidate every layer on every commit. `ARG` is
# declared after the expensive RUN above so that only this one-second step is replayed when it
# changes. Each package keeps its own semver and only gains a `+<metadata>` suffix, so the result
# stays a valid version. Empty on tags: the committed versions are the correct ones.
ARG VERSION_METADATA
RUN if [ -n "$VERSION_METADATA" ]; then \
    find /install \( -name package.json -o -name manifest.json \) -not -path '*/node_modules/*' \
    -exec node -e 'const fs=require("fs");const f=process.argv[1];const j=JSON.parse(fs.readFileSync(f,"utf8"));if(j.version){j.version=String(j.version).split("+")[0]+"+"+process.env.VERSION_METADATA;fs.writeFileSync(f,JSON.stringify(j,null,4))}' {} \; ; \
    fi

# Shared runtime base. Not a build target on its own: the actual final images are
# `runner` and `runner-preview-generator` below. Kept separate so apk can be purged
# per leaf (preview-generator still needs apk to install its extra libs).
FROM ${NODE_IMAGE} AS runner-base
ARG APP
WORKDIR /app

COPY --from=assemble /install ./

# Get ready for runtime
WORKDIR /app/apps/$APP
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
