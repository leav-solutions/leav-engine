import {Channel} from 'amqplib';
import {IResponse} from '../../types/types';
import {sendResponse} from './sendResponse';

describe('test sendResponse', () => {
    const channel: Mockify<Channel> = {
        publish: jest.fn(),
    };

    const response: IResponse = {
        context: 'context',
        input: 'myInput',
        results: [],
    };

    const exchange = 'exchange';
    const routingKey = 'routingKey';

    test('use channel publish', async () => {
        await sendResponse(channel as Channel, {exchange, routingKey}, response);

        expect(channel.publish).toBeCalled();
    });
});
