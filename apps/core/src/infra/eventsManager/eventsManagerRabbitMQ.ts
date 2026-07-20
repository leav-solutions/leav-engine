import * as crypto from 'node:crypto';
import {type IAmqpConnection, type AmqpMessageHandler} from '@leav/message-broker';
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

    // Generated once (not per (re)connect): each running instance keeps the same pubsub queue for
    // its whole lifetime, matching the previous behavior.
    const pubSubQueueName = `${config.instanceId}_${config.eventsManager.queues.pubsub_events_prefix}-${crypto.randomUUID()}`;

    // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
    const pubSubConsumerChannel = amqpConnection.createChannel({
        name: 'eventsManager:pubsubEvents',
        confirm: false,
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(pubSubQueueName, {durable: false, autoDelete: true});
            await t.bindQueue(pubSubQueueName, config.amqp.exchange, config.eventsManager.routingKeys.pubsub_events);
        },
    });

    return {
        publishDatabaseEvent: payload =>
            producerChannel.publish(config.amqp.exchange, config.eventsManager.routingKeys.data_events, payload),
        publishPubSubEvent: payload =>
            producerChannel.publish(config.amqp.exchange, config.eventsManager.routingKeys.pubsub_events, payload),
        consumePubSubEvents: handler => pubSubConsumerChannel.consume(pubSubQueueName, handler).then(() => undefined),
        close: async () => {
            await Promise.allSettled([producerChannel.close(), pubSubConsumerChannel.close()]);
        },
    };
}
