import {type IAmqpConnection, type AmqpMessageHandler} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface IFilesManagerRabbitMQ {
    consumeEvents(handler: AmqpMessageHandler): Promise<void>;
    consumePreviewResponses(handler: AmqpMessageHandler): Promise<void>;
    publishPreviewRequest(payload: string, priority?: number): Promise<void>;
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
}: IDeps): IFilesManagerRabbitMQ {
    const eventsChannel = amqpConnection.createChannel({
        name: 'filesManager:events',
        // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
        confirm: false,
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(config.filesManager.queues.events, {durable: true});
            await t.bindQueue(
                config.filesManager.queues.events,
                config.amqp.exchange,
                config.filesManager.routingKeys.events,
            );
            await t.prefetch(config.filesManager.prefetch ?? 5);
        },
    });

    const previewResponseChannel = amqpConnection.createChannel({
        name: 'filesManager:previewResponse',
        confirm: false,
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(config.filesManager.queues.previewResponse, {durable: true});
            await t.bindQueue(
                config.filesManager.queues.previewResponse,
                config.amqp.exchange,
                config.filesManager.routingKeys.previewResponse,
            );
            await t.prefetch(config.filesManager.prefetch ?? 5);
        },
    });

    // Producer only: no queue to assert, just publishes to the shared exchange.
    const previewRequestChannel = amqpConnection.createChannel({
        name: 'filesManager:previewRequest',
        setup: async t => {
            await coreExchange.assertOnto(t);
        },
    });

    return {
        consumeEvents: handler =>
            eventsChannel.consume(config.filesManager.queues.events, handler).then(() => undefined),
        consumePreviewResponses: handler =>
            previewResponseChannel.consume(config.filesManager.queues.previewResponse, handler).then(() => undefined),
        publishPreviewRequest: (payload, priority) =>
            previewRequestChannel.publish(
                config.amqp.exchange,
                config.filesManager.routingKeys.previewRequest,
                payload,
                {priority},
            ),
        close: async () => {
            await Promise.allSettled([
                eventsChannel.close(),
                previewResponseChannel.close(),
                previewRequestChannel.close(),
            ]);
        },
    };
}
