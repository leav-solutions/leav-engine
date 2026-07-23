import {type IAmqpConnection, type AmqpMessageHandler} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface ILogsCollectorRabbitMQ {
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
}: IDeps): ILogsCollectorRabbitMQ {
    const channel = amqpConnection.createChannel({
        name: 'logsCollector:events',
        // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
        confirm: false,
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(config.logsCollector.queue, {durable: true});
            await t.bindQueue(
                config.logsCollector.queue,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );
            await t.prefetch(config.logsCollector.prefetch ?? 1);
        },
    });

    return {
        consumeEvents: handler => channel.consume(config.logsCollector.queue, handler).then(() => undefined),
        close: () => channel.close(),
    };
}
