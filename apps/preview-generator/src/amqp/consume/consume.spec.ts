import {type IAmqpChannel, type IAmqpMessage} from '@leav/message-broker';
import {processPreview} from '../../processPreview/processPreview';
import {type IConfig, type IResponse} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {consume, handleMsg} from './consume';

vi.mock('../../processPreview/processPreview');
vi.mock('../sendResponse/sendResponse');

const config = {amqp: {connOpt: {hostname: 'localhost'}, consume: {queue: 'queue'}, publish: {}}};

describe('test consume', () => {
    test('execution', async () => {
        const requestChannel: Mockify<IAmqpChannel> = {
            consume: vi.fn().mockResolvedValue('tag'),
        };
        const responseChannel: Mockify<IAmqpChannel> = {};

        await consume(requestChannel as IAmqpChannel, responseChannel as IAmqpChannel, config as unknown as IConfig);

        expect(requestChannel.consume).toBeCalledWith(config.amqp.consume.queue, expect.anything());
    });
});

describe('test handleMsg', () => {
    test('call sendResponse', async () => {
        const context = 'context';

        const responseChannel: Mockify<IAmqpChannel> = {};

        const msg: Mockify<IAmqpMessage> = {
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

        await handleMsg(msg as IAmqpMessage, responseChannel as IAmqpChannel, config as unknown as IConfig);

        expect(sendResponse).toBeCalledWith(responseChannel, config.amqp.publish, response);
    });

    test('a processPreview failure is logged, not thrown', async () => {
        const responseChannel: Mockify<IAmqpChannel> = {};
        const msg: Mockify<IAmqpMessage> = {content: Buffer.from('{}')};

        vi.mocked(processPreview).mockRejectedValue(new Error('boom'));

        await expect(
            handleMsg(msg as IAmqpMessage, responseChannel as IAmqpChannel, config as unknown as IConfig),
        ).resolves.toBeUndefined();
    });
});
