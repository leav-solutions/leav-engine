import {generateMsgRabbitMQ, sendToRabbitMQ} from './rabbitmq';

vi.mock('../index');

describe('test sendToRabbitMQ', () => {
    test('check if display msg', async () => {
        const channelMock: any = {
            publish: vi.fn().mockResolvedValue(undefined),
        };

        await sendToRabbitMQ(
            JSON.stringify({
                event: 'create',
                time: Date.now(),
                pathAfter: 'path',
                pathBefore: null,
                inode: 'inode',
                rootKey: 'config.rootKey',
            }),
            {
                channel: channelMock,
            },
        );
        expect(channelMock.publish).not.toBeCalled();
    });

    test('check if send to rabbitmq', async () => {
        const channelMock: any = {
            publish: vi.fn().mockResolvedValue(undefined),
        };

        const msg = JSON.stringify({
            event: 'create',
            time: Date.now(),
            pathAfter: 'path',
            pathBefore: null,
            inode: 'inode',
            rootKey: 'config.rootKey',
        });

        const exchange = 'sendToRabbitMQ';
        const routingKey = '12345abc';

        await sendToRabbitMQ(msg, {
            channel: channelMock,
            exchange,
            routingKey,
        });

        expect(channelMock.publish).toBeCalledWith(exchange, routingKey, msg, expect.anything());
    });

    test('a failed publish is logged, not thrown', async () => {
        const channelMock: any = {
            publish: vi.fn().mockRejectedValue(new Error('broker unreachable')),
        };

        await expect(
            sendToRabbitMQ('msg', {
                channel: channelMock,
                exchange: 'sendToRabbitMQ',
                routingKey: '12345abc',
            }),
        ).resolves.toBeUndefined();
    });
});

describe('test generateMsgRabbitMQ', () => {
    test('check render generateMsgRabbitMQ', () => {
        const event = 'create';
        const pathBefore = './file';
        const pathAfter = './test';
        const inode = 12344;
        const rootKey = 'abc1244';
        const isDirectory = false;

        const res = generateMsgRabbitMQ(event, pathBefore, pathAfter, inode, isDirectory, rootKey);

        expect(res).toEqual(
            JSON.stringify({
                event,
                time: Math.round(Date.now() / 1000),
                pathAfter,
                pathBefore,
                isDirectory: false,
                inode,
                rootKey,
            }),
        );
    });
});
