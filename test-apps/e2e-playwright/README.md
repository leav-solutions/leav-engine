# e2e-playwright

## With local stack

With a light docker-compose with minimal service arangodb/rabbtimq/redis and leav_core.

No leav task-manager, logs-collector, indexation-manager. Add them later (with "all" mode inside core for instance) if needed.

We temporary need to have a specific image e2e-core.Dockerfile, but may change later. Automatically done in docker-compose.

> [!tip]
> You can use either the **amd64** or the **arm64** version of Leav docker image by specifying `DOCKER_LEAV_TAG` in .env (`develop` or `develop-arm64`).

Init .env for arm64 host (like Apple silicon CPU)

```shell
sed 's/^DOCKER_LEAV_TAG=.*$/DOCKER_LEAV_TAG=develop-arm64/' .env.template > .env
```

```
yarn local-stack-up
yarn local-stack-down
```

http://localhost:4001 (admin/admin)

# Run test

```
yarn playwright install
yarn start
yarn start-ui
yarn start-debug
```

## Gitlab-ci

For now, run job manually in MR, based on develop docker image. Later run them daily and maybe in MR with branch/commit docker image.

To try gitlab-ci job locally with [gitlab-ci-local](https://github.com/firecow/gitlab-ci-local):

```
gitlab-ci-local e2e-playwright
```
