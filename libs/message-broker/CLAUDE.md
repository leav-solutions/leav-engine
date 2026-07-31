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

## Piège : rien ne garantit l'ordre entre les `setup` de deux canaux

Un `setup` est **asynchrone et non attendu** à la création du canal : `createChannel()` retourne
immédiatement. `publish()` attend le `setup` de **son** canal (les messages sont mis en file en
interne), mais **jamais celui d'un autre canal**. Deux conséquences :

- **Chaque canal doit asserter tout ce dont il dépend.** Un canal qui fait `bindQueue` doit asserter
  lui-même l'exchange visé (idempotent si un autre canal l'assert aussi avec les mêmes arguments) :
  sinon, sur un broker où l'exchange n'existe pas encore, le `bindQueue` renvoie un `404` — traité
  comme **irrécupérable** par `amqp-connection-manager`, qui ferme le canal et ne le recrée jamais
  tant que la connexion vit. Consumer mort silencieusement.
- **`await consume()` ne garantit pas que le consumer soit enregistré côté broker.** Si la connexion
  n'est pas encore établie, le consumer est mémorisé et rejoué au premier `connect` — l'appel résout
  quand même (avec un `consumerTag` valide). Publier juste après un `await consume()` n'assure donc
  rien.

Dans un test qui publie immédiatement après avoir déclaré sa topologie, poser une **barrière
explicite** : `await channel.purgeQueue(queue)` attend le `waitForConnect()` interne du canal, donc
son `setup` appliqué (queue assertée **et** bindée) — tout en vidant les messages résiduels d'un run
précédent. Cf. [`apps/sync-scan/src/__tests__/e2e/index.test.ts`](../../apps/sync-scan/src/__tests__/e2e/index.test.ts)
et [`apps/automate-scan/src/__tests__/integration/watch_integration.test.ts`](../../apps/automate-scan/src/__tests__/integration/watch_integration.test.ts).

> ⚠️ Ne jamais asserter dans un handler `consume()` : la lib rattrape toute exception du handler
> (log + `nack`). Un `expect()` en échec y devient un **timeout de test opaque** au lieu d'un diff.
> Collecter les messages dans le handler, asserter dans le corps du test.

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
