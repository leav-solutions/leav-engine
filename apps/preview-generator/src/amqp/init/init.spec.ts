import {type Channel} from 'amqplib';
import {assertExchange, assertQueue, bindQueue, initAmqp} from './init';

const exchange = 'exchange';
const queue = 'queue';
const routingKey = 'routingKey';

describe('test assertExchange', () => {
    const channel: Mockify<Channel> = {
        assertExchange: vi.fn(),
    };
    test('assert exchange', async () => {
        await assertExchange(channel as Channel, 'direct', exchange);

        expect(channel.assertExchange).toBeCalledWith(exchange, expect.anything(), expect.anything());
    });
});

describe('test assertQueue', () => {
    const channel: Mockify<Channel> = {
        assertQueue: vi.fn(),
    };
    test('assert queue', async () => {
        await assertQueue(channel as Channel, queue);

        expect(channel.assertQueue).toBeCalledWith(queue, expect.anything());
    });
});

describe('test bindQueue', () => {
    const channel: Mockify<Channel> = {
        bindQueue: vi.fn(),
    };
    test('bind queue', async () => {
        await bindQueue(channel as Channel, queue, exchange, routingKey);

        expect(channel.bindQueue).toBeCalledWith(queue, exchange, routingKey);
    });
});

describe('test initAmqp', () => {
    const channel: Mockify<Channel> = {
        assertExchange: vi.fn(),
        assertQueue: vi.fn(),
        bindQueue: vi.fn(),
    };
    test('call other functions', async () => {
        await initAmqp(channel as Channel, 'direct', {exchange, queue, routingKey, maxPriority: 3});

        expect(channel.assertExchange).toBeCalledWith(exchange, expect.anything(), expect.anything());
        expect(channel.assertQueue).toBeCalledWith(queue, expect.anything());
        expect(channel.bindQueue).toBeCalledWith(queue, exchange, routingKey);
    });
});
