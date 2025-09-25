// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {type IAmqp, type onMessageFunc} from './types/amqp';
import {logger} from '@leav/logger';

export interface IAmqpService {
    publisher: {connection: amqp.ChannelModel; channel: amqp.ConfirmChannel};
    consumer: {connection: amqp.ChannelModel; channel: amqp.ConfirmChannel};
    publish(exchange: string, routingKey: string, msg: string, priority?: number): Promise<void>;
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
    let publisher: {connection: amqp.ChannelModel; channel: amqp.ConfirmChannel};
    let consumer: {connection: amqp.ChannelModel; channel: amqp.ConfirmChannel};

    const _init = async () => {
        const publisherConnection = await amqp.connect(config.connOpt);
        const publisherChannel = await publisherConnection.createConfirmChannel();
        await publisherChannel.assertExchange(config.exchange, config.type);

        const consumerConnection = await amqp.connect(config.connOpt);
        const consumerChannel = await consumerConnection.createConfirmChannel();
        await consumerChannel.prefetch(config.prefetch);

        publisher = {connection: publisherConnection, channel: publisherChannel};
        consumer = {connection: consumerConnection, channel: consumerChannel};
    };

    await _init();

    const publish: IAmqpService['publish'] = async (exchange, routingKey, msg, priority): Promise<void> => {
        try {
            await publisher.channel.checkExchange(exchange);
            await new Promise((resolve, reject) => {
                publisher.channel.publish(
                    exchange,
                    routingKey,
                    Buffer.from(msg),
                    {
                        persistent: true,
                        priority
                    },
                    (err, ok) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(ok);
                        }
                    }
                );
            });
        } catch (e) {
            throw new Error(`Fail to publish message to ${exchange}.`, {cause: e});
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
                    logger.error(`[${queue}/${routingKey}] Error while processing message: ${e.stack}`, {
                        message: {
                            ...msg,
                            content: msg.content.toString()
                        }
                    });
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
