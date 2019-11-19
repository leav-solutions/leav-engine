import {Channel} from 'amqplib';
import {IResponse} from './../../types';
import {sendResponse} from './publish';

describe('test sendResponse', () => {
    const channel: Mockify<Channel> = {
        publish: jest.fn()
    };

    const responses: IResponse[] = [
        {
            error_code: 0,
            error: null,
            output: 'test'
        }
    ];

    const exchange = 'exchange';
    const routingKey = 'routingKey';

    test('use channel publish', async () => {
        sendResponse(channel as Channel, responses, {exchange, routingKey});
    });
});
