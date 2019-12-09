import {processPreview} from '../../processPreview/processPreview';
import {IResult} from './../../types';
import {Channel, ConsumeMessage} from 'amqplib';
import {consume, handleMsg} from './consume';
import {sendResponse} from '../sendResponse/sendResponse';
import * as config from '../../../config/config_spec.json';

describe('test consume', () => {
    test('execution', async () => {
        const channel: Mockify<Channel> = {
            consume: jest.fn(),
        };

        await consume(channel as Channel, config);

        expect(channel.consume).toBeCalledWith(config.amqp.consume.queue, expect.anything(), expect.anything());
    });
});

describe('test handleMsg', () => {
    test('call sendResponse', async () => {
        const context = 'context';

        const channel: Mockify<Channel> = {
            ack: jest.fn(),
        };

        const msg: Mockify<ConsumeMessage> = {
            content: Buffer.from(
                JSON.stringify({
                    input: 'test',
                    context,
                    versions: [
                        {
                            sizes: [
                                {
                                    size: 600,
                                    output: 'test',
                                },
                            ],
                        },
                    ],
                }),
            ),
        };

        const response: IResult = {
            error: 0,
            params: {
                output: 'test',
                size: 800,
            },
        };

        (processPreview as jest.FunctionLike) = jest.fn(() => ({results: response, context}));
        (sendResponse as jest.FunctionLike) = jest.fn();

        await handleMsg(msg as ConsumeMessage, channel as Channel, config);

        expect(sendResponse).toBeCalledWith(channel, response, config.amqp.publish, context);
    });
});
