import {Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import {RMQConn, RMQMsg} from '../_types/rmq';
import config from '../config';

export const sendToRabbitMQ = async (msg: string, channel: Channel) => {
    const conf = await config;
    const {exchange, routingKey} = conf.rmq;

    try {
        await channel.publish(exchange, routingKey, Buffer.from(msg), {
            persistent: true
        });
    } catch (e) {
        console.error("105 - Can't publish to rabbitMQ");
        process.exit(105);
    }
};

export const generateMsgRabbitMQ = (
    event: string,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string
) => {
    const msg: RMQMsg = {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey
    };

    return JSON.stringify(msg);
};

export const init = (amqpConfig: Options.Connect, exchange: string, queue: string, routingKey: string, type: string) =>
    new Promise<RMQConn>(resolve => {
        amqp.connect(amqpConfig, async (error: any, connection: Connection | any) => {
            if (error) {
                console.error(error);
                console.error("101 - Can't connect to rabbitMQ");
                process.exit(101);
            }

            const channel = await connection.createChannel();

            try {
                await channel.assertExchange(exchange, type, {durable: true});
            } catch (e) {
                console.error('102 - Error when assert exchange', e.message);
                process.exit(102);
            }

            try {
                await channel.assertQueue(queue, {durable: true});
            } catch (e) {
                console.error('103 - Error when assert queue', e.message);
                process.exit(103);
            }

            try {
                await channel.bindQueue(queue, exchange, routingKey);
            } catch (e) {
                console.error('104 - Error when bind queue', e.message);
                process.exit(104);
            }

            resolve({channel, connection});
        });
    });
