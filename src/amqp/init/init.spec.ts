import {Channel} from 'amqplib';
import {initAmqp, assertExchange, assertQueue, bindQueue} from './init';

const exchange = 'exchange';
const queue = 'queue';
const routingKey = 'routingKey';

describe('test assertExchange', () => {
    const channel: Mockify<Channel> = {
        assertExchange: jest.fn()
    };
    test('assert exchange', async () => {
        await assertExchange(channel as Channel, exchange);

        expect(channel.assertExchange).toBeCalledWith(exchange, expect.anything(), expect.anything());
    });
});

describe('test assertQueue', () => {
    const channel: Mockify<Channel> = {
        assertQueue: jest.fn()
    };
    test('assert queue', async () => {
        await assertQueue(channel as Channel, queue);

        expect(channel.assertQueue).toBeCalledWith(queue, expect.anything());
    });
});

describe('test bindQueue', () => {
    const channel: Mockify<Channel> = {
        bindQueue: jest.fn()
    };
    test('bind queue', async () => {
        await bindQueue(channel as Channel, queue, exchange, routingKey);

        expect(channel.bindQueue).toBeCalledWith(queue, exchange, routingKey);
    });
});

describe('test initAmqp', () => {
    const channel: Mockify<Channel> = {
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn()
    };
    test('call other functions', async () => {
        (assertExchange as jest.FunctionLike) = jest.fn();
        (assertQueue as jest.FunctionLike) = jest.fn();
        (bindQueue as jest.FunctionLike) = jest.fn();

        await initAmqp(channel as Channel, {exchange, queue, routingKey});

        expect(assertExchange).toBeCalledWith(channel as Channel, exchange);
        expect(assertQueue).toBeCalledWith(channel as Channel, queue);
        expect(bindQueue).toBeCalledWith(channel as Channel, queue, exchange, routingKey);
    });
});
