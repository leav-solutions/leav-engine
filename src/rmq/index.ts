// import {amqp, Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib';
import {RMQConn, RMQMsg} from '../_types/rmq';

export const sendToRabbitMQ = async (msg: string, channel: amqp.Channel): Promise<void> => {
    try {
        await channel.publish(process.env.RMQ_EXCHANGE, process.env.RMQ_ROUTINGKEY, Buffer.from(msg), {
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

export const init = async (): Promise<RMQConn> => {
    try {
        const connection: amqp.Connection = await amqp.connect({
            protocol: process.env.RMQ_CONN_PROTOCOL,
            hostname: process.env.RMQ_CONN_HOSTNAME,
            username: process.env.RMQ_CONN_USERNAME,
            password: process.env.RMQ_CONN_PASSWORD
        });

        const channel: amqp.Channel = await connection.createChannel();

        await channel.assertExchange(process.env.RMQ_EXCHANGE, process.env.RMQ_TYPE, {durable: true});

        return {channel, connection};
    } catch (e) {
        throw e;
    }
};
