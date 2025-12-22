# e2e-playwright

## With local stack

With a light docker-compose with minimal service arangodb/rabbtimq/redis and leav_core.

No leav task-manager, logs-collector, indexation-manager. Add them later (with "all" mode inside core for instance) if needed.

We temporary need to have a specific image e2e-core.Dockerfile, but may change later. Automatically done in docker-compose.

```
yarn local-stack-up
yarn local-stack-down
```

http://localhost:4001 (admin/admin)

# Run test

```
yarn playwright install
yarn start
```

## Gitlab-ci

in progress
