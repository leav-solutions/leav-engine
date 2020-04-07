// import {amqp, Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib';
import {RMQConn, RMQMsg} from '../_types/rmq';
import config from '../config';

export const sendToRabbitMQ = async (msg: string, channel: amqp.Channel): Promise<void> => {
    try {
        const conf = await config;
        const {exchange, routingKey} = conf.rmq;

        await channel.publish(exchange, routingKey, Buffer.from(msg), {
            persistent: true
        });
    } catch (e) {
        throw e;
    }
};

export const generateMsgRabbitMQ = (
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

export const init = async (connOpt: amqp.Options.Connect, exchange: string, type: string): Promise<RMQConn> => {
    try {
        const connection: amqp.Connection = await amqp.connect(connOpt);
        const channel: amqp.Channel = await connection.createChannel();

        await channel.assertExchange(exchange, type, {durable: true});

        return {channel, connection};
    } catch (e) {
        throw e;
    }
};
