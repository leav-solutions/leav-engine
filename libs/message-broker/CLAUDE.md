# libs/message-broker — CLAUDE.md

`@leav/message-broker` — Abstraction RabbitMQ partagée entre les apps backend.

## Deux API en transition (ADR-007)

La lib expose **deux** API en parallèle pendant la migration décrite par
[ADR-007](../../docs/adr/ADR-007-amqp-resilience.md) :

- **`amqpService`** (historique) — toujours utilisée par les domaines `apps/core` pas encore
  migrés. Deux connexions `amqplib` brutes (publisher/consumer), **aucune résilience** (pas de
  reconnexion/backoff/heartbeat), fuite les objets `connection`/`channel` bruts.
- **`createAmqpConnection`** (nouvelle, ADR-007) — enveloppe `amqp-connection-manager` au-dessus
  d'`amqplib`. Reconnexion + backoff automatiques, heartbeat explicite, topologie (assert/bind)
  ré-appliquée automatiquement au reconnect, contrat ack/nack explicite pour `consume()`, `close()`
  résilient (`Promise.allSettled`). Ne fuite jamais d'objet `amqplib` brut.

`amqpService` sera supprimée une fois tous les domaines migrés vers `createAmqpConnection`
(migration domaine par domaine, un `apps/core/src/infra/<domaine>/` à la fois).

## Exports clés

### Historique (`amqpService`)

| Export          | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `amqpService`   | Factory function — crée une instance `IAmqpService`                      |
| `IAmqpService`  | Interface : `publisher`, `consumer`, `publish()`, `consume()`, `close()` |
| `IAmqp`         | Config de connexion RabbitMQ                                             |
| `IMessageBody`  | Type générique du corps d'un message                                     |
| `OnMessageFunc` | Type du callback de réception de message                                 |

```ts
import amqpService from '@leav/message-broker';

const broker = await amqpService({host, port, user, password, ...});
await broker.publish(queue, message);
await broker.consume(queue, (msg) => { /* handler */ });
await broker.close();
```

### Nouvelle (`createAmqpConnection`, ADR-007)

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
