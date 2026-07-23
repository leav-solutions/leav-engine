import {createAmqpConnection, type IAmqpTopology} from '@leav/message-broker';
import {PreviewPriority} from '@leav/utils';
import {type IConfig} from '../types/types';
import {consume} from './consume/consume';
import {startConsume} from './startConsume';

vi.mock('@leav/message-broker');
vi.mock('./consume/consume');

describe('test startConsume', () => {
    test('creates the connection, both channels via setup, and starts consuming', async () => {
        const requestChannel = {};
        const responseChannel = {};
        const capturedSetups: Array<(t: IAmqpTopology) => Promise<void>> = [];

        const createChannel = vi.fn().mockImplementation((params: {setup?: (t: IAmqpTopology) => Promise<void>}) => {
            capturedSetups.push(params.setup!);
            return capturedSetups.length === 1 ? requestChannel : responseChannel;
        });

        vi.mocked(createAmqpConnection).mockReturnValue({
            createChannel,
            getConnectionState: vi.fn(),
            close: vi.fn(),
        });
        vi.mocked(consume).mockResolvedValue(undefined);

        const mockconf = {
            amqp: {
                connOpt: {hostname: 'localhost'},
                heartbeatInSeconds: 30,
                type: 'direct',
                consume: {queue: 'q-in', exchange: 'e-in', routingKey: 'rk-in'},
                publish: {queue: 'q-out', exchange: 'e-out', routingKey: 'rk-out'},
            },
        };

        await startConsume(mockconf as unknown as IConfig);

        expect(createAmqpConnection).toBeCalledWith(
            expect.objectContaining({
                connOpt: mockconf.amqp.connOpt,
                heartbeatInSeconds: mockconf.amqp.heartbeatInSeconds,
            }),
        );
        expect(createChannel).toBeCalledTimes(2);
        expect(consume).toBeCalledWith(requestChannel, responseChannel, mockconf);

        const topology: Mockify<IAmqpTopology> = {
            assertExchange: vi.fn(),
            assertQueue: vi.fn(),
            bindQueue: vi.fn(),
            prefetch: vi.fn(),
        };

        await capturedSetups[0](topology as IAmqpTopology);
        expect(topology.assertExchange).toBeCalledWith('e-in', 'direct', expect.anything());
        expect(topology.assertQueue).toBeCalledWith(
            'q-in',
            expect.objectContaining({maxPriority: PreviewPriority.HIGH}),
        );
        expect(topology.bindQueue).toBeCalledWith('q-in', 'e-in', 'rk-in');
        expect(topology.prefetch).toBeCalledWith(1);

        await capturedSetups[1](topology as IAmqpTopology);
        expect(topology.assertExchange).toBeCalledWith('e-out', 'direct', expect.anything());
    });
});
