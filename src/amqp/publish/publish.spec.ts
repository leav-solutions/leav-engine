import {Channel} from 'amqplib';
import {IResult} from './../../types';
import {sendResponse} from './publish';

describe('test sendResponse', () => {
    const channel: Mockify<Channel> = {
        publish: jest.fn(),
    };

    const responses: IResult[] = [
        {
            error: 0,
            params: {
                output: 'test',
                size: 800,
            },
        },
    ];

    const exchange = 'exchange';
    const routingKey = 'routingKey';

    test('use channel publish', async () => {
        sendResponse(channel as Channel, responses, {exchange, routingKey}, 'context');
    });
});
