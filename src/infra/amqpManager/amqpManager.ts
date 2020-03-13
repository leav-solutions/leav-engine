import {Channel, connect} from 'amqplib';
import winston from 'winston';
import {onMessageFunc} from '_types/amqp';
import * as Config from '_types/config';

export interface IAmqpManager {
    publish(routingKey: string, queue: string, msg: string): Promise<void>;
    consume(queue: string, routingKey: string, onMessage: onMessageFunc, prefetch?: number): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.utils.logger'?: winston.Winston;
}

export default function({config = null, 'core.utils.logger': logger = null}: IDeps): IAmqpManager {
    const _initChannel = async (queue: string, routingKey: string): Promise<Channel> => {
        const conn = await connect(`amqp://${config.amqp.host}`);
        const channel = await conn.createChannel();
        await channel.assertExchange(config.amqp.exchange, config.amqp.type);
        await channel.assertQueue(queue, {durable: true});
        await channel.bindQueue(queue, config.amqp.exchange, routingKey);

        return channel;
    };

    return {
        async publish(routingKey: string, queue: string, msg: string): Promise<void> {
            const channel = await _initChannel(queue, routingKey);

            channel.publish(config.amqp.exchange, routingKey, Buffer.from(msg));
        },
        async consume(queue: string, routingKey: string, onMessage: onMessageFunc, prefetch?: number): Promise<void> {
            const channel = await _initChannel(queue, routingKey);

            if (prefetch) {
                await channel.prefetch(prefetch); // number of message handle in the same time
            }

            channel.consume(queue, async msg => {
                if (!msg) {
                    return;
                }

                const msgString = msg.content.toString();
                try {
                    await onMessage(msgString);
                } catch (e) {
                    logger.error(
                        `[${queue}/${routingKey}] Error while processing message:
                            ${e.message}.
                            Message was: ${msgString}
                        `
                    );
                } finally {
                    channel.ack(msg);
                }
            });
        }
    };
}
