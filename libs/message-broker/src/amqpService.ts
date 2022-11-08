// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqp, onMessageFunc} from './_types/amqp';
import * as amqp from 'amqplib';

export interface IAmqpService {
    publisher: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    consumer: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    publish(exchange: string, routingKey: string, msg: string): Promise<void>;
    consume(queue: string, routingKey: string, onMessage: onMessageFunc): Promise<void>;
    close(): Promise<void>;
}

interface IDeps {
    config: IAmqp;
}

export default async function ({config}: IDeps): Promise<IAmqpService> {
    let publisher: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    let consumer: {connection: amqp.Connection; channel: amqp.ConfirmChannel};
    let retries = 0;

    const init = async () => {
        console.debug({connOpt: config.connOpt});
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

    await init();

    const publish = async (exchange: string, routingKey: string, msg: string): Promise<void> => {
        try {
            await publisher.channel.checkExchange(exchange);
            publisher.channel.publish(exchange, routingKey, Buffer.from(msg), {persistent: true});
            await publisher.channel.waitForConfirms();
            retries = 0;
        } catch (e) {
            if (!retries) {
                retries += 1;

                try {
                    await init();
                    await publish(exchange, routingKey, msg);
                } catch (err) {
                    throw new Error('2 tries reached. Stop sync.');
                }
            } else {
                throw new Error('2 tries reached. Stop sync.');
            }
        }
    };

    const consume = async (queue: string, routingKey: string, onMessage: onMessageFunc): Promise<void> => {
        await consumer.channel.consume(queue, async msg => {
            if (!msg) {
                return;
            }

            const msgString = msg.content.toString();

            try {
                await onMessage(msgString);
            } catch (e) {
                console.error(
                    `[${queue}/${routingKey}] Error while processing message:
                        ${e}.
                        Message was: ${msgString}
                    `
                );
            } finally {
                consumer.channel.ack(msg);
            }
        });
    };

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
