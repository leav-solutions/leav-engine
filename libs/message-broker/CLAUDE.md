# libs/message-broker — CLAUDE.md

`@leav/message-broker` — Abstraction RabbitMQ partagée entre les apps backend.

## Ce que c'est

Factory function qui crée un service AMQP avec deux connexions séparées
(publisher + consumer) via `amqplib`. Gère le cycle de vie des connexions et canaux.

## Exports clés

| Export          | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `amqpService`   | Factory function principale — crée une instance `IAmqpService`           |
| `IAmqpService`  | Interface : `publisher`, `consumer`, `publish()`, `consume()`, `close()` |
| `IAmqp`         | Config de connexion RabbitMQ                                             |
| `IMessageBody`  | Type générique du corps d'un message                                     |
| `OnMessageFunc` | Type du callback de réception de message                                 |

## Usage

```ts
import amqpService from '@leav/message-broker';

const broker = await amqpService({host, port, user, password, ...});
await broker.publish(queue, message);
await broker.consume(queue, (msg) => { /* handler */ });
await broker.close();
```
