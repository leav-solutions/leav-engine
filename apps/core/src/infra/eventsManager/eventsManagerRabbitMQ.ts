import * as crypto from 'node:crypto';
import {type IAmqpConnection, type IAmqpChannel, type AmqpMessageHandler} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface IEventsManagerRabbitMQ {
    publishDatabaseEvent(payload: string): Promise<void>;
    publishPubSubEvent(payload: string): Promise<void>;
    consumePubSubEvents(handler: AmqpMessageHandler): Promise<void>;
    close(): Promise<void>;
}

interface IDeps {
    'core.infra.amqp.connection': IAmqpConnection;
    'core.infra.amqp.coreExchange': ICoreExchangeRabbitMQ;
    config: IConfig;
}

export default function ({
    'core.infra.amqp.connection': amqpConnection,
    'core.infra.amqp.coreExchange': coreExchange,
    config,
}: IDeps): IEventsManagerRabbitMQ {
    // Producer only: no queue to assert, just publishes to the shared exchange.
    const producerChannel = amqpConnection.createChannel({
        name: 'eventsManager:events',
        setup: async t => {
            await coreExchange.assertOnto(t);
        },
    });

    // Created lazily, only when consumePubSubEvents() is actually called (SERVER mode only) - every
    // other core mode injects this same domain but never consumes pubsub events. Creating this
    // channel/queue eagerly in the factory used to leak: RabbitMQ never cleans up an autoDelete
    // queue that never had a consumer, so every non-SERVER instance would accumulate a copy of
    // every pubsub event forever.
    let pubSubConsumerChannel: IAmqpChannel | undefined;

    return {
        publishDatabaseEvent: payload =>
            producerChannel.publish(config.amqp.exchange, config.eventsManager.routingKeys.data_events, payload),
        publishPubSubEvent: payload =>
            producerChannel.publish(config.amqp.exchange, config.eventsManager.routingKeys.pubsub_events, payload),
        consumePubSubEvents: handler => {
            // Generated once (not per (re)connect): this instance keeps the same pubsub queue for
            // its whole lifetime, matching the previous behavior.
            const pubSubQueueName = `${config.instanceId}_${config.eventsManager.queues.pubsub_events_prefix}-${crypto.randomUUID()}`;

            // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
            pubSubConsumerChannel = amqpConnection.createChannel({
                name: 'eventsManager:pubsubEvents',
                confirm: false,
                setup: async t => {
                    await coreExchange.assertOnto(t);
                    await t.assertQueue(pubSubQueueName, {durable: false, autoDelete: true});
                    await t.bindQueue(
                        pubSubQueueName,
                        config.amqp.exchange,
                        config.eventsManager.routingKeys.pubsub_events,
                    );
                    await t.prefetch(config.eventsManager.pubsubPrefetch ?? 5);
                },
            });

            return pubSubConsumerChannel.consume(pubSubQueueName, handler).then(() => undefined);
        },
        close: async () => {
            await Promise.allSettled([producerChannel.close(), pubSubConsumerChannel?.close() ?? Promise.resolve()]);
        },
    };
}
