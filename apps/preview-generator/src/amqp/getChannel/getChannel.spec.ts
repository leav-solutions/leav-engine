import {connect, type Options} from 'amqplib';
import {getChannel} from './getChannel';

vi.mock('amqplib');

describe('getChannel', () => {
    test('should use connect', async () => {
        const createChannel = vi.fn();
        vi.mocked(connect).mockResolvedValue({createChannel} as any);

        const amqpConfig: Options.Connect = {
            protocol: 'amqp',
            hostname: 'localhost',
            username: 'guest',
            password: 'guest',
        };

        await getChannel(amqpConfig);

        expect(connect).toBeCalledWith(amqpConfig);
        expect(createChannel).toBeCalled();
    });
});
