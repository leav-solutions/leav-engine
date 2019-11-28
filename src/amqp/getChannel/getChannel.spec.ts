import {Options, connect} from 'amqplib';
import {getChannel} from './getChannel';
import * as config from '../../../config/config_spec.json';

describe('getChannel', () => {
    test('should use connect', async () => {
        const createChannel = jest.fn();
        (connect as jest.FunctionLike) = jest.fn(() => ({
            createChannel,
        }));

        const amqpConfig: Options.Connect = {
            protocol: config.amqp.protocol,
            hostname: config.amqp.hostname,
            username: config.amqp.username,
            password: config.amqp.password,
        };

        await getChannel(amqpConfig);

        expect(connect).toBeCalledWith(amqpConfig);
        expect(createChannel).toBeCalled();
    });
});
