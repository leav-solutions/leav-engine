// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpConn, onMessageFunc} from '_types/amqp';
import winston from 'winston';
import * as Config from '_types/config';

export interface IAmqpService {
    publish?(exchange: string, routingKey: string, msg: string): Promise<void>;
    consume?(queue: string, routingKey: string, onMessage: onMessageFunc): Promise<void>;
    amqp?: {publisher: IAmqpConn; consumer: IAmqpConn};
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqp'?: {publisher: IAmqpConn; consumer: IAmqpConn};
    'core.utils.logger'?: winston.Winston;
}

export default function ({
    config = null,
    'core.infra.amqp': amqp = null,
    'core.utils.logger': logger = null
}: IDeps): IAmqpService {
    return {
        amqp,
        async publish(exchange: string, routingKey: string, msg: string): Promise<void> {
            await amqp.publisher.channel.checkExchange(exchange);
            amqp.publisher.channel.publish(exchange, routingKey, Buffer.from(msg));
            await amqp.publisher.channel.waitForConfirms();
        },
        async consume(queue: string, routingKey: string, onMessage: onMessageFunc): Promise<void> {
            await amqp.consumer.channel.consume(queue, async msg => {
                if (!msg) {
                    return;
                }

                const msgString = msg.content.toString();

                try {
                    await onMessage(msgString);
                } catch (e) {
                    logger.error(
                        `[${queue}/${routingKey}] Error while processing message:
                            ${e}.
                            Message was: ${msgString}
                        `
                    );
                } finally {
                    amqp.consumer.channel.ack(msg);
                }
            });
        }
    };
}
