import {IAmqpConn, onMessageFunc} from '_types/amqp';
import winston from 'winston';
import * as Config from '_types/config';

export interface IAmqpService {
    amqpConn?: IAmqpConn;
    publish?(routingKey: string, msg: string): Promise<void>;
    consume?(queue: string, routingKey: string, onMessage: onMessageFunc, prefetch?: number): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqp'?: IAmqpConn;
    'core.utils.logger'?: winston.Winston;
}

export default function({
    config = null,
    'core.infra.amqp': amqpConn = null,
    'core.utils.logger': logger = null
}: IDeps): IAmqpService {
    return {
        amqpConn,
        async publish(routingKey: string, msg: string): Promise<void> {
            await amqpConn.channel.checkExchange(config.amqp.exchange);
            amqpConn.channel.publish(config.amqp.exchange, routingKey, Buffer.from(msg));
            await amqpConn.channel.waitForConfirms();
        },
        async consume(queue: string, routingKey: string, onMessage: onMessageFunc, prefetch?: number): Promise<void> {
            if (prefetch) {
                await amqpConn.channel.prefetch(prefetch); // number of message handle in the same time
            }

            await amqpConn.channel.consume(queue, async msg => {
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
                    amqpConn.channel.ack(msg);
                }
            });
        }
    };
}
