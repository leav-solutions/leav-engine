import * as amqp from 'amqplib';
import {RMQConn, RMQMsg} from '../_types/rmq';
import * as Config from '../_types/config';

export const send = async ({exchange, routingKey}: Config.RMQ, msg: string, channel: amqp.Channel): Promise<void> => {
    await channel.checkExchange(exchange);
    await channel.publish(exchange, routingKey, Buffer.from(msg), {
        persistent: true
    });
};

export const generateMsg = (
    event: string,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string,
    hash?: string
): string => {
    const msg: RMQMsg = {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey,
        hash
    };

    return JSON.stringify(msg);
};

export const init = async ({connOpt, exchange, type}: Config.RMQ): Promise<RMQConn> => {
    const connection: amqp.Connection = await amqp.connect(connOpt);
    const channel: amqp.Channel = await connection.createChannel();

    await channel.assertExchange(exchange, type, {durable: true});

    return {channel, connection};
};
