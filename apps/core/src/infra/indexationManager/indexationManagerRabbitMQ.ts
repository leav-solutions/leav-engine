import {type IAmqpConnection, type AmqpMessageHandler} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface IIndexationManagerRabbitMQ {
    consumeEvents(handler: AmqpMessageHandler): Promise<void>;
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
}: IDeps): IIndexationManagerRabbitMQ {
    const channel = amqpConnection.createChannel({
        name: 'indexationManager:events',
        // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
        confirm: false,
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(config.indexationManager.queues.events, {durable: true});
            await t.bindQueue(
                config.indexationManager.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );
            await t.prefetch(config.indexationManager.prefetch ?? 5);
        },
    });

    return {
        consumeEvents: handler =>
            channel.consume(config.indexationManager.queues.events, handler).then(() => undefined),
        close: () => channel.close(),
    };
}
