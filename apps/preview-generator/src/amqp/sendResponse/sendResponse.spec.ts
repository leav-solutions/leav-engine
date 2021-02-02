// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Channel} from 'amqplib';
import {IResponse} from '../../types/types';
import {sendResponse} from './sendResponse';

describe('test sendResponse', () => {
    const channel: Mockify<Channel> = {
        publish: jest.fn()
    };

    const response: IResponse = {
        context: 'context',
        input: 'myInput',
        results: []
    };

    const exchange = 'exchange';
    const routingKey = 'routingKey';

    test('use channel publish', async () => {
        await sendResponse(channel as Channel, {exchange, routingKey}, response);

        expect(channel.publish).toBeCalled();
    });
});
