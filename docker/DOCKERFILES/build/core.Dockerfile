# This Dockerfile is meant to build the core of LEAV-Engine.
# We're using the "multi-stage build" feature of Docker in order to limit the size of the final image.
#
# The stages are not cosmetic: they exist so Docker can cache and parallelize. Two rules to preserve:
#   - never copy sources before the `deps` stage, or every source change reinstalls the whole monorepo;
#   - keep one stage per buildable workspace, so touching one front leaves the others CACHED.

ARG NODE_IMAGE=node:24.19.0-alpine3.24

# rsync is used by the manifests and assemble stages. Installed once here so it is already in the
# cache of every stage that needs it — the runtime stage does not derive from this one.
FROM ${NODE_IMAGE} AS base
RUN apk --no-cache --update add rsync

# Keep only what `yarn install` reads. This stage is replayed on every source change, but its
# *output* is stable, so the install stage below stays cached as long as no package.json and no
# lockfile moves. `apps/*/scripts/` is required: apps/admin runs one of them in a postinstall.
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

# Dev dependencies for the core and the fronts. This is the layer worth caching.
# The cache mount targets the `cacheFolder` of .yarnrc.yml (project-local, since
# `enableGlobalCache: false`), so downloaded archives survive from one build to the next.
# No `--immutable`: .dockerignore keeps test-apps/ out of the context, so its workspaces are missing
# from the tree and yarn has to rewrite the lockfile (YN0028).
FROM base AS deps
WORKDIR /build
COPY --from=manifests /manifests/ ./
RUN --mount=type=cache,target=/build/.yarn/cache,sharing=locked \
    yarn install

# Sources shared by every build stage below. The fronts resolve @leav/ui and @leav/utils to library
# *sources* through vite-config-common.mjs, so libs/ is needed by all of them.
FROM deps AS sources
# Increase Node.js memory limit to avoid build failures for app-studio on new docker-build gitlab-runner
ENV NODE_OPTIONS="--max-old-space-size=4096"
COPY *.json vite-config-common.mjs ./
COPY libs/ ./libs

# One stage per buildable workspace: BuildKit runs them concurrently, and touching a single one
# leaves the others CACHED — including on a retry after a transient OOM.
# `yarn workspace core build` runs `tsc -b`, which also builds the referenced libs/*/dist that the
# rsync below ships: nothing else builds them.
FROM sources AS core-build
COPY apps/core ./apps/core
RUN yarn workspace core build

# The fronts do not need apps/core: their outDir ../core/applications/<name> is created here.
FROM sources AS front-admin
COPY apps/admin ./apps/admin
RUN yarn workspace admin build:install

FROM sources AS front-app-studio
COPY apps/app-studio ./apps/app-studio
RUN yarn workspace app-studio build:install

FROM sources AS front-login
COPY apps/login ./apps/login
RUN yarn workspace login build:install

FROM sources AS front-portal
COPY apps/portal ./apps/portal
RUN yarn workspace portal build:install

# Gather the build outputs, then install production dependencies.
# This stage branches from core-build because the rsync below needs apps/core/dist, apps/core/src
# and libs/*/dist, which that stage produced.
FROM core-build AS assemble
COPY --from=front-admin /build/apps/core/applications/admin ./apps/core/applications/admin
COPY --from=front-app-studio /build/apps/core/applications/app-studio ./apps/core/applications/app-studio
COPY --from=front-login /build/apps/core/applications/login ./apps/core/applications/login
COPY --from=front-portal /build/apps/core/applications/portal ./apps/core/applications/portal

WORKDIR /install

# Copy only production files for core and its dependencies
# We use rsync to be able to include/exclude files and folders easily
# And install only production dependencies for core
RUN --mount=type=cache,target=/build/.yarn/cache,sharing=locked \
    rsync -am \
    --exclude=".yarn/cache" \
    --exclude="vite-config-*.mjs" \
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

### RUNNER FOR CORE ###
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

COPY --from=assemble /install ./
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
# To avoid error at startup, since https://github.com/yarnpkg/yarn/releases/tag/v1.22.21
# error This project's package.json defines "packageManager": "yarn@4.0.2". However the current global version of Yarn is 1.22.22.
ENV SKIP_YARN_COREPACK_CHECK=1

# Useful for e2e playwright tests to run that service in gitlab-ci
EXPOSE 4001

CMD ["sh", "-c", "yarn run db:migrate && yarn run start"]
