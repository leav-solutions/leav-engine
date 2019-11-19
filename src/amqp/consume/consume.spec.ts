import {IResponse} from './../../types';
import {checkFile} from './../../generate';
import {Channel, ConsumeMessage} from 'amqplib';
import {consume, handleMsg} from './consume';
import {sendResponse} from './../publish/publish';
import * as config from '../../../config/config_spec.json';

describe('test consume', () => {
    test('execution', async () => {
        const channel: Mockify<Channel> = {
            consume: jest.fn()
        };

        await consume(channel as Channel, config);

        expect(channel.consume).toBeCalledWith(config.amqp.consume.queue, expect.anything(), expect.anything());
    });
});

describe('test handleMsg', () => {
    test('call sendResponse', async () => {
        const channel: Mockify<Channel> = {};
        const msg: Mockify<ConsumeMessage> = {
            content: Buffer.from(
                JSON.stringify({
                    input: 'test',
                    output: 'test',
                    sizes: [
                        {
                            width: 600,
                            height: 600
                        }
                    ]
                })
            )
        };

        const response: IResponse = {
            error_code: 0,
            error: null,
            output: 'test'
        };
        (checkFile as jest.FunctionLike) = jest.fn(() => response);
        (sendResponse as jest.FunctionLike) = jest.fn();

        await handleMsg(msg as ConsumeMessage, channel as Channel, config);

        expect(sendResponse).toBeCalledWith(channel, response, config.amqp.publish);
    });
});
