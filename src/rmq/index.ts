import {IRMQMsg} from '../types';
import {Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import config from '../config';

export const sendToRabbitMQ = async (msg: string, channel: Channel) => {
    const conf = await config;
    const {exchange, routingKey} = conf.rmq;

    try {
        channel.publish(exchange, routingKey, Buffer.from(msg), {
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
    const msg: IRMQMsg = {
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

export const getChannel = async (
    amqpConfig: Options.Connect,
    exchange: string,
    queue: string,
    routingKey: string,
    type: string
) => {
    return new Promise<Channel>(async resolve => {
        amqp.connect(amqpConfig, async (error0: any, connection: Connection | any) => {
            if (error0) {
                console.log(error0);
                console.error("101 - Can't connect to rabbitMQ");
                process.exit(101);
            }

            const ch = await connection.createChannel();

            try {
                await ch.assertExchange(exchange, type, {durable: true});
            } catch (e) {
                console.error('102 - Error when assert exchange', e.message);
                process.exit(102);
            }

            try {
                await ch.assertQueue(queue, {durable: true});
            } catch (e) {
                console.error('103 - Error when assert queue', e.message);
                process.exit(103);
            }

            try {
                await ch.bindQueue(queue, exchange, routingKey);
            } catch (e) {
                console.error('104 - Error when bind queue', e.message);
                process.exit(104);
            }

            resolve(ch);
        });
    });
};
