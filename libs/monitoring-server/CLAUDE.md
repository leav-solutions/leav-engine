# libs/monitoring-server — CLAUDE.md

`@leav/monitoring-server` — Serveur HTTP de monitoring (health check + métriques Prometheus).

## Ce que c'est

Factory function qui démarre un petit serveur HTTP (Hono) exposant
des endpoints standards pour l'observabilité. Utilisé par les apps backend.

## Exports clés

| Export                          | Description                             |
| ------------------------------- | --------------------------------------- |
| `monitoringServer()`            | Factory — crée et démarre le serveur    |
| `IMonitoringServer`             | Interface : `init()`, `close()`         |
| `IMonitoringServerParams`       | Config (port, health check function…)   |
| `MonitoringHealthCheckFunction` | Type du callback de health check custom |

## Endpoints exposés

| Route         | Description                                             |
| ------------- | ------------------------------------------------------- |
| `GET /`       | Message de bienvenue                                    |
| `GET /health` | Health check (callback custom optionnel, OK par défaut) |

## Usage

```ts
import {monitoringServer} from '@leav/monitoring-server';

const server = monitoringServer({port: 9090, healthCheck: myHealthFn});
await server.init();
// ...
await server.close();
```
