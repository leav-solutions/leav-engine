import {logger} from '@leav/logger';
import {type IAmqpParams, type IMessageSend} from './../types';

export const sendToRabbitMQ = async (msg: string, amqp?: IAmqpParams): Promise<void> => {
    if (amqp && amqp.channel && amqp.exchange && amqp.routingKey) {
        const {channel, exchange, routingKey} = amqp;

        try {
            await channel.publish(exchange, routingKey, msg, {persistent: true});
        } catch (e) {
            // createAmqpConnection reconnects automatically - a failed publish just loses this one
            // event (sync-scan's reconciliation catches up on it later), not worth crashing for.
            logger.error(`Can't publish to rabbitMQ because ${(e as Error).message}`);
        }
    } else {
        // else just display the infos
        logger.info(msg);
    }
};

export const generateMsgRabbitMQ = (
    event: string,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string,
    hash?: string,
) => {
    const params: IMessageSend = {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey,
        hash,
    };

    return JSON.stringify(params);
};
