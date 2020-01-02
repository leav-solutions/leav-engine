import {Channel} from 'amqplib';
import {IResult} from '../../types/types';
import {sendResponse} from './sendResponse';

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
                name: 'big',
            },
        },
    ];

    const exchange = 'exchange';
    const routingKey = 'routingKey';

    test('use channel publish', async () => {
        sendResponse(channel as Channel, responses, {exchange, routingKey}, 'context');
    });
});
