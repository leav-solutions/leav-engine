import {type IAmqpConnection, type AmqpMessageHandler} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface IAutomationRabbitMQ {
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
}: IDeps): IAutomationRabbitMQ {
    const channel = amqpConnection.createChannel({
        name: 'automation:events',
        // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
        confirm: false,
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(config.automation.queues.events, {durable: true});
            await t.bindQueue(
                config.automation.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );
            await t.prefetch(config.automation.prefetch ?? 1);
        },
    });

    return {
        // createAmqpConnection's default contract: resolve => ack; throw => nack(discard).
        // Reproduces interface/automation.ts's previous behavior exactly (ack on success, discard on error).
        consumeEvents: handler => channel.consume(config.automation.queues.events, handler).then(() => undefined),
        close: () => channel.close(),
    };
}
