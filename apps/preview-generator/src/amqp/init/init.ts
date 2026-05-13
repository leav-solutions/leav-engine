import {logger} from '@leav/logger';
import {type Channel} from 'amqplib';

export const initAmqp = async (
    channel: Channel,
    type: string,
    {
        exchange,
        queue,
        routingKey,
        maxPriority,
    }: {exchange: string; queue: string; routingKey: string; maxPriority?: number},
) => {
    await assertExchange(channel, type, exchange);
    await assertQueue(channel, queue, maxPriority);
    await bindQueue(channel, queue, exchange, routingKey);
};

export const assertExchange = async (channel: Channel, type: string, exchange: string) => {
    try {
        await channel.assertExchange(exchange, type, {durable: true});
    } catch (e) {
        logger.error(`102 - Error when assert exchange because ${e.message}`);
        process.exit(102);
    }
};

export const assertQueue = async (channel: Channel, queue: string, maxPriority?: number) => {
    try {
        await channel.assertQueue(queue, {durable: true, maxPriority});
    } catch (e) {
        logger.error(`103 - Error when assert queue because ${e.message}`);
        process.exit(103);
    }
};

export const bindQueue = async (channel: Channel, queue: string, exchange: string, routingKey: string) => {
    try {
        await channel.bindQueue(queue, exchange, routingKey);
    } catch (e) {
        logger.error(`104 - Error when bind queue because ${e.message}`);
        process.exit(104);
    }
};
