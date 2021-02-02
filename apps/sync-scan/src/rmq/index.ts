import * as amqp from 'amqplib';
import * as Config from '../_types/config';
import {EventTypes} from '../_types/events';
import {IRMQConn, IRMQMsg} from '../_types/rmq';

export const send = (
    {exchange, routingKey}: Config.IConfigAmqp,
    msg: string,
    channel: amqp.ConfirmChannel
): Promise<void> =>
    new Promise(async (resolve, reject) => {
        await channel.checkExchange(exchange);

        channel.publish(
            exchange,
            routingKey,
            Buffer.from(msg),
            {
                persistent: true
            },
            (err, ok) => (err ? reject(err) : resolve())
        );
    });

export const generateMsg = (
    event: EventTypes,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string,
    hash?: string
): string => {
    const msg: IRMQMsg = {
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

export const init = async ({connOpt, exchange, type}: Config.IConfigAmqp): Promise<IRMQConn> => {
    const connection: amqp.Connection = await amqp.connect(connOpt);
    const channel: amqp.ConfirmChannel = await connection.createConfirmChannel();

    await channel.assertExchange(exchange, type, {durable: true});

    return {channel, connection};
};
