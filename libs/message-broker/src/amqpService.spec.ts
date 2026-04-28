// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type * as amqp from 'amqplib';
import amqpService, {type IAmqpService} from './amqpService';
import {type IAmqp} from './types/amqp';

type Mockify<T> = {[P in keyof T]?: T[P] extends (...args: any) => any ? ReturnType<typeof vi.fn> : T[P]};

const amqpMockConfig: Mockify<IAmqp> = {connOpt: {hostname: 'localhost'}, exchange: 'exchange', type: 'direct'};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    consume: vi.fn(),
    publish: vi.fn().mockImplementation((exchange, routingKey, content, options, cb) => {
        cb(null, true);
    }),
    waitForConfirms: vi.fn(),
    prefetch: vi.fn(),
    close: vi.fn(),
};

const mockAmqpConnection: Mockify<amqp.ChannelModel> = {
    close: vi.fn(),
    createConfirmChannel: vi.fn().mockReturnValue(mockAmqpChannel),
};

vi.mock('amqplib', () => ({
    connect: vi.fn().mockImplementation(() => mockAmqpConnection),
}));

describe('amqp', () => {
    let amqpServ: IAmqpService;

    beforeAll(async () => {
        amqpServ = await amqpService({
            config: amqpMockConfig as IAmqp,
        });
    });

    afterAll(async () => {
        await amqpServ.close();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Set up message listening', async () => {
        const mockCbFunc = vi.fn();

        await amqpServ.consume('myQueue', 'someRoutingKey', mockCbFunc);

        expect(mockAmqpChannel.consume).toBeCalled();
    });

    test('Publish a message', async () => {
        await amqpServ.publish('exchange', 'someRoutingKey', JSON.stringify({test: 'Some value'}));
        expect(mockAmqpChannel.publish).toBeCalled();
    });

    test('Publish a message with priority', async () => {
        await amqpServ.publish('exchange', 'someRoutingKey', JSON.stringify({test: 'Some value'}), 3);

        expect(mockAmqpChannel.publish?.mock.calls[0][3].priority).toBe(3);
    });
});
