# Monitoring

Add minimal monitoring stack only for metrics (for now) is available

It has prometheus, grafana and an otel collector

Start it with:

`docker compose up -d`

- http://grafana.leav.localhost/
- http://prometheus.leav.localhost/

## Enabling OTel auto-instrumentation in `core`

The monitoring backends above run as a separate compose project. To make the
`core` container actually export telemetry to them, set the
`OTEL_AUTO_INSTRUMENT` env var when starting the main compose stack:

```shell
cd root/docker/
OTEL_AUTO_INSTRUMENT=1 docker compose up -d
```

Or persist it in a `.env` file at the repo root/docker:

```dotenv
OTEL_AUTO_INSTRUMENT=1
```

When unset OR 0 (default), `core` starts without `--import @opentelemetry/auto-instrumentations-node/register`, so the monitoring stack is fully optional.
