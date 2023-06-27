// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqp} from './_types/amqp';
import amqpService, {IAmqpService} from './amqpService';

type Mockify<T> = {[P in keyof T]?: T[P] extends (...args: any) => any ? jest.Mock : T[P]};

const amqpMockConfig: Mockify<IAmqp> = {connOpt: {hostname: 'localhost'}, exchange: 'exchange', type: 'direct'};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn(),
    close: jest.fn()
};

const mockAmqpConnection: Mockify<amqp.Connection> = {
    close: jest.fn(),
    createConfirmChannel: jest.fn().mockReturnValue(mockAmqpChannel)
};

jest.mock('amqplib', () => ({
    connect: jest.fn().mockImplementation(() => mockAmqpConnection)
}));

describe('amqp', () => {
    let amqpServ: IAmqpService;

    beforeAll(async () => {
        amqpServ = await amqpService({
            config: amqpMockConfig as IAmqp
        });
    });

    afterAll(async () => {
        await amqpServ.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set up message listening', async () => {
        const mockCbFunc = jest.fn();

        await amqpServ.consume('myQueue', 'someRoutingKey', mockCbFunc);

        expect(mockAmqpChannel.consume).toBeCalled();
    });

    test('Publish a message', async () => {
        await amqpServ.publish('exchange', 'someRoutingKey', JSON.stringify({test: 'Some value'}));

        expect(mockAmqpChannel.checkExchange).toBeCalled();
        expect(mockAmqpChannel.publish).toBeCalled();
        expect(mockAmqpChannel.waitForConfirms).toBeCalled();
    });

    test('Publish a message with priority', async () => {
        await amqpServ.publish('exchange', 'someRoutingKey', JSON.stringify({test: 'Some value'}), 3);

        expect(mockAmqpChannel.publish.mock.calls[0][3].priority).toBe(3);
    });
});
