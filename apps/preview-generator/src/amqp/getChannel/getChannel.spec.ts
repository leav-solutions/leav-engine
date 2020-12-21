import {connect, Options} from 'amqplib';
import {getChannel} from './getChannel';

describe('getChannel', () => {
    test('should use connect', async () => {
        const createChannel = jest.fn();
        (connect as jest.FunctionLike) = jest.fn(() => ({
            createChannel
        }));

        const amqpConfig: Options.Connect = {
            protocol: 'amqp',
            hostname: 'localhost',
            username: 'guest',
            password: 'guest'
        };

        await getChannel(amqpConfig);

        expect(connect).toBeCalledWith(amqpConfig);
        expect(createChannel).toBeCalled();
    });
});
