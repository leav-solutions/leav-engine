import {createAmqpConnection, type IAmqpChannel} from '@leav/message-broker';
import {PreviewPriority} from '@leav/utils';
import {type IConfig} from '../types/types';
import {consume} from './consume/consume';

export const startConsume = async (config: IConfig): Promise<void> => {
    const connection = createAmqpConnection({
        connOpt: config.amqp.connOpt,
        heartbeatInSeconds: config.amqp.heartbeatInSeconds,
        connectionName: 'preview-generator',
    });

    const requestChannel: IAmqpChannel = connection.createChannel({
        name: 'preview-generator:request',
        confirm: false,
        setup: async t => {
            await t.assertExchange(config.amqp.consume.exchange, config.amqp.type, {durable: true});
            await t.assertQueue(config.amqp.consume.queue, {durable: true, maxPriority: PreviewPriority.HIGH});
            await t.bindQueue(config.amqp.consume.queue, config.amqp.consume.exchange, config.amqp.consume.routingKey);
            await t.prefetch(1);
        },
    });

    // Producer only: the response queue is already asserted/bound by its consumer
    // (apps/core's filesManagerRabbitMQ.previewResponseChannel) - core boots before this app
    // (docker-compose's "depends_on: core: condition: service_healthy").
    const responseChannel: IAmqpChannel = connection.createChannel({
        name: 'preview-generator:response',
        setup: async t => {
            await t.assertExchange(config.amqp.publish.exchange, config.amqp.type, {durable: true});
        },
    });

    await consume(requestChannel, responseChannel, config);
};
