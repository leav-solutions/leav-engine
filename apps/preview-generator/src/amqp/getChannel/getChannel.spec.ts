// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
