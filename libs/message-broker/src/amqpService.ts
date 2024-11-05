// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqp, onMessageFunc} from './types/amqp';

export interface IAmqpService {
    publisher: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    consumer: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    publish(exchange: string, routingKey: string, msg: string, priority?: number): Promise<boolean>;
    consume(
        queue: string,
        routingKey: string,
        onMessage: onMessageFunc,
        consumerTag?: string
    ): Promise<amqp.Replies.Consume>;
    close(): Promise<void>;
}

interface IDeps {
    config: IAmqp;
}

export default async function ({config}: IDeps): Promise<IAmqpService> {
    let publisher: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    let consumer: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    let retries = 0;

    const _init = async () => {
        const publisherConnection = await amqp.connect(config.connOpt);
        const publisherChannel = await publisherConnection.createConfirmChannel();
        await publisherChannel.assertExchange(config.exchange, config.type);
        await publisherChannel.prefetch(config.prefetch);

        const consumerConnection = await amqp.connect(config.connOpt);
        const consumerChannel = await consumerConnection.createConfirmChannel();
        await consumerChannel.assertExchange(config.exchange, config.type);
        await consumerChannel.prefetch(config.prefetch);

        publisher = {connection: publisherConnection, channel: publisherChannel};
        consumer = {connection: consumerConnection, channel: consumerChannel};
    };

    await _init();

    const publish: IAmqpService['publish'] = async (exchange, routingKey, msg, priority): Promise<boolean> => {
        try {
            await publisher.channel.checkExchange(exchange);
            const response = publisher.channel.publish(exchange, routingKey, Buffer.from(msg), {
                persistent: true,
                priority
            });
            await publisher.channel.waitForConfirms();
            retries = 0;

            return response;
        } catch (e) {
            if (!retries) {
                retries += 1;

                try {
                    await _init();
                    await publish(exchange, routingKey, msg, priority);
                } catch (err) {
                    throw new Error('2 tries reached. Stop sync.');
                }
            } else {
                throw new Error('2 tries reached. Stop sync.');
            }
        }
    };

    const consume = async (
        queue: string,
        routingKey: string,
        onMessage: onMessageFunc,
        consumerTag?: string
    ): Promise<amqp.Replies.Consume> =>
        consumer.channel.consume(
            queue,
            async msg => {
                if (!msg) {
                    return;
                }

                try {
                    await onMessage(msg);
                } catch (e) {
                    console.error(process.pid, 'err amqp', e);
                    console.error(
                        `[${queue}/${routingKey}] Error while processing message:
                        ${e}.
                        Message was: ${msg.content.toString()}
                    `
                    );
                } finally {
                    // TODO: add ack if msg has not been acked
                }
            },
            {consumerTag}
        );

    const close = async () => {
        await publisher.channel.close();
        await publisher.connection.close();
        await consumer.channel.close();
        await consumer.connection.close();
    };

    return {
        publisher,
        consumer,
        publish,
        consume,
        close
    };
}
