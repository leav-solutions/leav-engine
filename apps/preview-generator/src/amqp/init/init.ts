// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Channel} from 'amqplib';

export const initAmqp = async (
    channel: Channel,
    type: string,
    {exchange, queue, routingKey}: {exchange: string; queue: string; routingKey: string}
) => {
    await assertExchange(channel, type, exchange);
    await assertQueue(channel, queue);
    await bindQueue(channel, queue, exchange, routingKey);
};

export const assertExchange = async (channel: Channel, type: string, exchange: string) => {
    try {
        await channel.assertExchange(exchange, type, {durable: true});
    } catch (e) {
        console.error('102 - Error when assert exchange', e.message);
        process.exit(102);
    }
};

export const assertQueue = async (channel: Channel, queue: string) => {
    try {
        await channel.assertQueue(queue, {durable: true});
    } catch (e) {
        console.error('103 - Error when assert queue', e.message);
        process.exit(103);
    }
};

export const bindQueue = async (channel: Channel, queue: string, exchange: string, routingKey: string) => {
    try {
        await channel.bindQueue(queue, exchange, routingKey);
    } catch (e) {
        console.error('104 - Error when bind queue', e.message);
        process.exit(104);
    }
};
