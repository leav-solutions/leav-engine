import * as fs from 'fs';
import * as path from 'path';
import {Channel, Options} from 'amqplib';
import {IConfig, IMessageConsume} from './../../types';
import {getChannel} from './../../amqp/getChannel/getChannel';

import configSpec = require('../../../config/config_spec.json');

describe('test preview generation', () => {
    test('jpg with clip to png', async () => {
        const output = '/src/files/test/preview/jpg.clip.png';
        const msgSend: IMessageConsume = {
            input: '/src/files/test/test.clip.jpg',
            context: 'context',
            versions: [
                {
                    sizes: [
                        {
                            size: 800,
                            output,
                        },
                    ],
                },
            ],
        };

        await sendTestMessage(configSpec, msgSend);

        // wait for the preview to be create
        await new Promise(res => setTimeout(res, 10));

        expect(fs.existsSync(path.join(configSpec.rootPath, output))).toBeTruthy();
    });

    test('jpg to png', async () => {
        const output = '/src/files/test/preview/jpg.png';
        const msgSend: IMessageConsume = {
            input: '/src/files/test/test.jpg',
            context: 'context',
            versions: [
                {
                    sizes: [
                        {
                            size: 800,
                            output,
                        },
                    ],
                },
            ],
        };

        await sendTestMessage(configSpec, msgSend);

        // wait for the preview to be create
        await new Promise(res => setTimeout(res, 10));

        expect(fs.existsSync(path.join(configSpec.rootPath, output))).toBeTruthy();
    });

    test('png to png', async () => {
        const output = '/src/files/test/preview/png.png';
        const msgSend: IMessageConsume = {
            input: '/src/files/test/test.png',
            context: 'context',
            versions: [
                {
                    sizes: [
                        {
                            size: 800,
                            output,
                        },
                    ],
                },
            ],
        };

        await sendTestMessage(configSpec, msgSend);

        // wait for the preview to be create
        await new Promise(res => setTimeout(res, 10));

        expect(fs.existsSync(path.join(configSpec.rootPath, output))).toBeTruthy();
    });

    test('png with transparent to png', async () => {
        const output = '/src/files/test/preview/png.transparent.png';
        const msgSend: IMessageConsume = {
            input: '/src/files/test/test.transparent.png',
            context: 'context',
            versions: [
                {
                    sizes: [
                        {
                            size: 800,
                            output,
                        },
                    ],
                },
            ],
        };

        await sendTestMessage(configSpec, msgSend);

        // wait for the preview to be create
        await new Promise(res => setTimeout(res, 10));

        expect(fs.existsSync(path.join(configSpec.rootPath, output))).toBeTruthy();
    });

    test('pdf to png', async () => {
        const output = '/src/files/test/preview/pdf.png';
        const msgSend = {
            input: '/src/files/test/test.pdf',
            context: 'context',
            versions: [
                {
                    sizes: [
                        {
                            size: 800,
                            output,
                        },
                    ],
                },
            ],
        };

        await sendTestMessage(configSpec, msgSend);

        // wait for the preview to be create
        await new Promise(res => setTimeout(res, 10));

        expect(fs.existsSync(path.join(configSpec.rootPath, output))).toBeTruthy();
    });
});

const sendTestMessage = async (config: IConfig, msg: IMessageConsume) => {
    const {exchange, routingKey} = config.amqp.consume;

    const amqpConfig: Options.Connect = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password,
    };

    const channel: Channel = await getChannel(amqpConfig);

    const buffer = Buffer.from(JSON.stringify(msg));
    return channel.publish(exchange, routingKey, buffer);
};
