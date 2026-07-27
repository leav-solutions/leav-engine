import {type IAmqpChannel} from '@leav/message-broker';
import {type IResponse} from '../../types/types';
import {sendResponse} from './sendResponse';

describe('test sendResponse', () => {
    const channel: Mockify<IAmqpChannel> = {
        publish: vi.fn().mockResolvedValue(undefined),
    };

    const response: IResponse = {
        context: 'context',
        input: 'myInput',
        results: [],
    };

    const exchange = 'exchange';
    const routingKey = 'routingKey';

    test('use channel publish', async () => {
        await sendResponse(channel as IAmqpChannel, {exchange, routingKey}, response);

        expect(channel.publish).toBeCalledWith(exchange, routingKey, expect.any(String), {persistent: true});
    });
});
