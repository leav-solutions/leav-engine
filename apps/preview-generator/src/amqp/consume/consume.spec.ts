// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Channel, type ConsumeMessage} from 'amqplib';
import {processPreview} from '../../processPreview/processPreview';
import {type IConfig, type IResponse} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {consume, handleMsg} from './consume';

vi.mock('../../processPreview/processPreview');
vi.mock('../sendResponse/sendResponse');

const config = {amqp: {hostname: 'localhost', consume: {queue: 'queue'}, publish: {}}};

describe('test consume', () => {
    test('execution', async () => {
        const channel: Mockify<Channel> = {
            consume: vi.fn(),
            prefetch: vi.fn(),
        };

        await consume(channel as Channel, config as unknown as IConfig);

        expect(channel.consume).toBeCalledWith(config.amqp.consume.queue, expect.anything(), expect.anything());
    });
});

describe('test handleMsg', () => {
    test('call sendResponse', async () => {
        const context = 'context';

        const channel: Mockify<Channel> = {
            ack: vi.fn(),
            prefetch: vi.fn(),
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

        const response: IResponse = {
            input: 'input',
            context,
            results: [
                {
                    error: 0,
                    params: {
                        output: 'test',
                        size: 800,
                        name: 'big',
                    },
                },
            ],
        };

        vi.mocked(processPreview).mockReturnValue(response as any);

        await handleMsg(msg as ConsumeMessage, channel as Channel, config as unknown as IConfig);

        expect(sendResponse).toBeCalledWith(channel, config.amqp.publish, response);
    });
});
