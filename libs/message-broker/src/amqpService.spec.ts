// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqp} from './_types/amqp';
import amqpService, {IAmqpService} from './amqpService';

describe('amqp', () => {
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
        prefetch: jest.fn()
    };

    let amqpServ: IAmqpService;

    beforeAll(async done => {
        amqpServ = await amqpService({
            config: amqpMockConfig as IAmqp
        });

        // As queue is only used in tests to consume messages, it's not created in amqp.init. Thus, we have to do it here
        await amqpServ.consumer.channel.assertQueue('myQueue');
        await amqpServ.consumer.channel.bindQueue('myQueue', 'exchange', 'someRoutingKey');

        amqpServ.publisher.channel = mockAmqpChannel as amqp.ConfirmChannel;
        amqpServ.consumer.channel = mockAmqpChannel as amqp.ConfirmChannel;

        done();
    });

    afterAll(async done => {
        await amqpServ.close();
        done();
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
});
