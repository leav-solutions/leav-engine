# libs/message-broker — CLAUDE.md

`@leav/message-broker` — Abstraction RabbitMQ partagée entre les apps backend.

`createAmqpConnection` enveloppe `amqp-connection-manager` au-dessus d'`amqplib` : reconnexion +
backoff automatiques, heartbeat explicite, topologie (assert/bind) ré-appliquée automatiquement au
reconnect, contrat ack/nack explicite pour `consume()`, `close()` résilient. Ne fuite jamais
d'objet `amqplib` brut.

> L'ancienne API `amqpService`/`IAmqpService` (deux connexions `amqplib` brutes, sans résilience,
> fuyant `connection`/`channel`) a été entièrement retirée — tous les domaines `apps/core` ainsi que
> `apps/automate-scan`, `apps/preview-generator` et `apps/sync-scan` sont migrés vers
> `createAmqpConnection`. Voir [ADR-007](../../docs/adr/ADR-007-amqp-resilience.md) pour le contexte
> historique de cette migration.

## Exports clés

| Export                  | Description                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `createAmqpConnection`  | Factory — une instance = une connexion résiliente vers **un** broker                                                      |
| `IAmqpConnection`       | `createChannel()`, `getConnectionState()`, `close()`                                                                      |
| `IAmqpChannel`          | `publish()`, `consume()`, `ack()`, `nack()`, `cancel()`, `close()`, `purgeQueue()`, `deleteQueue()`                       |
| `IAmqpConnectionConfig` | `connOpt`, `heartbeatInSeconds` (défaut 30, **jamais 0** — piège amqplib 2.0), `reconnectTimeInSeconds`, `connectionName` |
| `IAmqpMessage`          | Sous-ensemble typé de `amqp.ConsumeMessage` (pas de fuite du type amqplib)                                                |
| `IAmqpTopology`         | Passé au `setup` d'un channel : `assertExchange`/`assertQueue`/`bindQueue`/`prefetch`                                     |

`getConnectionState()` est un **getter synchrone** (pull), pas un abonnement : suffit pour un usage
type health check (`libs/monitoring-server`'s `healthCheckFunction`), sans le risque d'un listener
oublié. Les transitions de connexion sont déjà loguées en interne par la lib (pas besoin de s'y
abonner juste pour ça).

Un channel = un usage fonctionnel (ex. `automation:events`, `sdo:export`…). La topologie
(exchange/queue/bind/prefetch) se déclare dans `setup`, ré-exécutée automatiquement à chaque
(re)connexion. Le contrat `consume()` par défaut : le handler résout → `ack` automatique ;
il jette → `nack` automatique sans requeue (configurable via `requeueOnError`). Pour les cas où
l'app doit gérer elle-même l'ack/nack (ex. pattern pause/reprise), `manualAck: true`.

`purgeQueue()`/`deleteQueue()` sont des utilitaires ad hoc (test/ops) — volontairement absents de
`IAmqpTopology`/`setup` : ce sont des opérations destructives, jamais quelque chose qu'on veut
rejouer automatiquement à chaque reconnexion. La topologie applicative normale (déclarative,
rejouée au reconnect) reste `assertExchange`/`assertQueue`/`bindQueue`/`prefetch` via `setup`.

```ts
import {createAmqpConnection} from '@leav/message-broker';

const connection = createAmqpConnection({connOpt: {hostname, username, password}, connectionName: 'leav-core'});
// connection.getConnectionState() -> 'connecting' | 'connected' | 'disconnected' | 'closed'

const channel = connection.createChannel({
    name: 'automation:events',
    setup: async t => {
        await t.assertQueue('automations_events', {durable: true});
        await t.bindQueue('automations_events', 'leav_core', 'data.events');
    },
});

await channel.consume('automations_events', async msg => {
    // traiter msg.content — jette pour nack, résout pour ack (contrat automatique)
});

await connection.close();
```
