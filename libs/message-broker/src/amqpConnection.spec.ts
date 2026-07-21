import {createAmqpConnection} from './amqpConnection';
import {type IAmqpConnection} from './types/amqp';

type ConsumeHandler = (msg: any) => void | Promise<void>;

const mockRawChannel = {
    assertExchange: vi.fn().mockResolvedValue(undefined),
    assertQueue: vi.fn().mockResolvedValue(undefined),
    bindQueue: vi.fn().mockResolvedValue(undefined),
    prefetch: vi.fn().mockResolvedValue(undefined),
};

let capturedSetup: ((rawChannel: any) => Promise<void>) | undefined;
let capturedConsumeHandler: ConsumeHandler | undefined;

const mockChannelWrapper = {
    publish: vi.fn().mockResolvedValue(true),
    consume: vi.fn().mockImplementation((_queue: string, handler: ConsumeHandler, opts: {consumerTag?: string}) => {
        capturedConsumeHandler = handler;
        return Promise.resolve({consumerTag: opts?.consumerTag ?? 'generated-tag'});
    }),
    ack: vi.fn(),
    nack: vi.fn(),
    cancel: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
};

const connectionManagerListeners: Record<string, Array<(...args: any[]) => void>> = {};

const mockConnectionManager = {
    on: vi.fn((event: string, cb: (...args: any[]) => void) => {
        (connectionManagerListeners[event] ??= []).push(cb);
    }),
    createChannel: vi.fn().mockImplementation((opts: {setup?: (rawChannel: any) => Promise<void>}) => {
        capturedSetup = opts.setup;
        return mockChannelWrapper;
    }),
    close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('amqp-connection-manager', () => ({
    connect: vi.fn().mockImplementation(() => mockConnectionManager),
}));

const fakeMsg = () => ({content: Buffer.from('hi'), fields: {}, properties: {}}) as any;

describe('createAmqpConnection', () => {
    let connection: IAmqpConnection;

    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(connectionManagerListeners)) {
            delete connectionManagerListeners[key];
        }
        capturedSetup = undefined;
        capturedConsumeHandler = undefined;
        connection = createAmqpConnection({
            connOpt: {hostname: 'localhost', username: 'guest', password: 'guest'},
            connectionName: 'test',
        });
    });

    test('createChannel wires the topology setup to the raw channel', async () => {
        connection.createChannel({
            name: 'test-channel',
            setup: async t => {
                await t.assertExchange('ex', 'direct');
                await t.assertQueue('q', {durable: true});
                await t.bindQueue('q', 'ex', 'rk');
                await t.prefetch(3);
            },
        });

        expect(capturedSetup).toBeDefined();
        await capturedSetup!(mockRawChannel);

        expect(mockRawChannel.assertExchange).toHaveBeenCalledWith('ex', 'direct', undefined);
        expect(mockRawChannel.assertQueue).toHaveBeenCalledWith('q', {durable: true});
        expect(mockRawChannel.bindQueue).toHaveBeenCalledWith('q', 'ex', 'rk');
        expect(mockRawChannel.prefetch).toHaveBeenCalledWith(3);
    });

    test('createChannel forwards confirm (default true, explicit false for consumer-only channels)', () => {
        connection.createChannel({name: 'c-default'});
        expect(mockConnectionManager.createChannel).toHaveBeenLastCalledWith(
            expect.objectContaining({name: 'c-default', confirm: true}),
        );

        connection.createChannel({name: 'c-no-confirm', confirm: false});
        expect(mockConnectionManager.createChannel).toHaveBeenLastCalledWith(
            expect.objectContaining({name: 'c-no-confirm', confirm: false}),
        );
    });

    test('consume: handler resolving acks the message (default contract)', async () => {
        const channel = connection.createChannel({name: 'c'});
        const handler = vi.fn().mockResolvedValue(undefined);

        await channel.consume('q', handler);
        const msg = fakeMsg();
        await capturedConsumeHandler!(msg);

        expect(handler).toHaveBeenCalledWith(msg);
        expect(mockChannelWrapper.ack).toHaveBeenCalledWith(msg);
        expect(mockChannelWrapper.nack).not.toHaveBeenCalled();
    });

    test('consume: handler throwing nacks without requeue by default (closes the old never-implemented TODO)', async () => {
        const channel = connection.createChannel({name: 'c'});
        const handler = vi.fn().mockRejectedValue(new Error('boom'));

        await channel.consume('q', handler);
        const msg = fakeMsg();
        await capturedConsumeHandler!(msg);

        expect(mockChannelWrapper.nack).toHaveBeenCalledWith(msg, false, false);
        expect(mockChannelWrapper.ack).not.toHaveBeenCalled();
    });

    test('consume: requeueOnError true requeues the message on failure', async () => {
        const channel = connection.createChannel({name: 'c'});
        const handler = vi.fn().mockRejectedValue(new Error('boom'));

        await channel.consume('q', handler, {requeueOnError: true});
        const msg = fakeMsg();
        await capturedConsumeHandler!(msg);

        expect(mockChannelWrapper.nack).toHaveBeenCalledWith(msg, false, true);
    });

    test('consume: manualAck leaves ack/nack entirely to the caller', async () => {
        const channel = connection.createChannel({name: 'c'});
        const handler = vi.fn().mockResolvedValue(undefined);

        await channel.consume('q', handler, {manualAck: true});
        const msg = fakeMsg();
        await capturedConsumeHandler!(msg);

        expect(handler).toHaveBeenCalledWith(msg);
        expect(mockChannelWrapper.ack).not.toHaveBeenCalled();
        expect(mockChannelWrapper.nack).not.toHaveBeenCalled();

        channel.ack(msg);
        expect(mockChannelWrapper.ack).toHaveBeenCalledWith(msg);
    });

    test('consume: manualAck still catches a throwing handler without crashing', async () => {
        const channel = connection.createChannel({name: 'c'});
        const handler = vi.fn().mockRejectedValue(new Error('boom'));

        await channel.consume('q', handler, {manualAck: true});
        const msg = fakeMsg();
        await expect(capturedConsumeHandler!(msg)).resolves.toBeUndefined();

        expect(mockChannelWrapper.ack).not.toHaveBeenCalled();
        expect(mockChannelWrapper.nack).not.toHaveBeenCalled();
    });

    test('close() settles all channels and the connection even if one rejects (Promise.allSettled)', async () => {
        connection.createChannel({name: 'c1'});
        mockChannelWrapper.close.mockRejectedValueOnce(new Error('channel close failed'));

        await expect(connection.close()).resolves.toBeUndefined();

        expect(mockChannelWrapper.close).toHaveBeenCalled();
        expect(mockConnectionManager.close).toHaveBeenCalled();
    });

    test('getConnectionState reflects the connection lifecycle (pull-based, no subscription needed)', async () => {
        expect(connection.getConnectionState()).toBe('connecting');

        connectionManagerListeners.connect[connectionManagerListeners.connect.length - 1]();
        expect(connection.getConnectionState()).toBe('connected');

        connectionManagerListeners.disconnect[connectionManagerListeners.disconnect.length - 1]({
            err: new Error('lost'),
        });
        expect(connection.getConnectionState()).toBe('disconnected');

        await connection.close();
        expect(connection.getConnectionState()).toBe('closed');
    });
});
