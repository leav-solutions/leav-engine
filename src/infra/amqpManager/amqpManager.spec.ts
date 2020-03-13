import {Channel, connect} from 'amqplib';
import * as Config from '_types/config';
import amqpManager from './amqpManager';

const amqpMockConfig: Mockify<Config.IAmqp> = {host: 'localhost'};
const mockConfig: Mockify<Config.IConfig> = {
    amqp: amqpMockConfig as Config.IAmqp
};

const mockAmqpChannel: Mockify<Channel> = {
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn()
};

describe('amqp', () => {
    (connect as jest.FunctionLike) = jest.fn().mockReturnValue({
        createChannel: jest.fn().mockReturnValue(mockAmqpChannel)
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Publish a message', async () => {
        const amqpHandler = amqpManager({config: mockConfig as Config.IConfig});

        await amqpHandler.publish('someRoutingKey', 'myQueue', JSON.stringify({test: 'Some value'}));

        expect(mockAmqpChannel.assertExchange).toBeCalled();
        expect(mockAmqpChannel.assertQueue).toBeCalled();
        expect(mockAmqpChannel.bindQueue).toBeCalled();
        expect(mockAmqpChannel.publish).toBeCalled();
    });

    test('Set up message listening', async () => {
        const amqpHandler = amqpManager({config: mockConfig as Config.IConfig});
        const mockCbFunc = jest.fn();

        await amqpHandler.consume('myQueue', 'someRoutingKey', mockCbFunc);

        expect(mockAmqpChannel.assertExchange).toBeCalled();
        expect(mockAmqpChannel.assertQueue).toBeCalled();
        expect(mockAmqpChannel.bindQueue).toBeCalled();
        expect(mockAmqpChannel.consume).toBeCalled();
    });
});
