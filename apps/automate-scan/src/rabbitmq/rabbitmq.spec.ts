// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generateMsgRabbitMQ, sendToRabbitMQ} from './rabbitmq';

jest.mock('../index');

describe('test sendToRabbitMQ', () => {
    test('check if display msg', () => {
        console.info = jest.fn();
        sendToRabbitMQ(
            JSON.stringify({
                event: 'create',
                time: Date.now(),
                pathAfter: 'path',
                pathBefore: null,
                inode: 'inode',
                rootKey: 'config.rootKey'
            }),
            undefined
        );
        expect(console.info).toHaveBeenCalledTimes(1);
    });

    test('check if send to rabbitmq', () => {
        const channelMock: any = {
            publish: jest.fn()
        };

        const msg = JSON.stringify({
            event: 'create',
            time: Date.now(),
            pathAfter: 'path',
            pathBefore: null,
            inode: 'inode',
            rootKey: 'config.rootKey'
        });

        const exchange = 'sendToRabbitMQ';
        const routingKey = '12345abc';

        sendToRabbitMQ(msg, {
            channel: channelMock,
            exchange,
            routingKey
        });

        expect(channelMock.publish).toBeCalledWith(exchange, routingKey, Buffer.from(msg), expect.anything());
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
                rootKey
            })
        );
    });
});
