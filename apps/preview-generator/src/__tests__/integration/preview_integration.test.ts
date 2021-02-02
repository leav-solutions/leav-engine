// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Channel, ConsumeMessage, Options} from 'amqplib';
import * as fs from 'fs';
import * as path from 'path';
import {getChannel} from '../../amqp/getChannel/getChannel';
import {getConfig} from '../../getConfig/getConfig';
import {IConfig, IMessageConsume} from '../../types/types';

describe('test preview generation', () => {
    let config;

    beforeAll(async () => {
        config = await getConfig();
    });

    test('jpg with clip to png', async done => {
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
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);

            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    test('jpg to png', async done => {
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
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);
            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    test('png to png', async done => {
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
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);
            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    test('png with transparent to png', async done => {
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
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);

            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    test('pdf to png', async done => {
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
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);

            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    test('docx to png', async done => {
        jest.setTimeout(10000);
        const output = '/src/files/test/preview/docx.png';
        const msgSend = {
            input: '/src/files/test/test.docx',
            context: 'context',
            versions: [
                {
                    sizes: [
                        {
                            size: 800,
                            output,
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);
            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    // this test can take time
    test('pdf with multi page to png', async done => {
        jest.setTimeout(15000);

        const output = '/src/files/test/preview/docx.png';
        const multiPage = '/src/files/test/preview/pdfMultiPage/';

        const msgSend = {
            input: '/src/files/test/testMultiPage.pdf',
            context: 'context',
            versions: [
                {
                    multiPage,
                    sizes: [
                        {
                            size: 800,
                            output,
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);
            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();
            expect(fs.existsSync(path.join(config.outputRootPath, multiPage, '01.pdf'))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });

    test('docx with multi page to png', async done => {
        jest.setTimeout(15000);

        const output = '/src/files/test/preview/docxMultiPage.png';
        const multiPage = '/src/files/test/preview/docxMultiPage/';

        const msgSend = {
            input: '/src/files/test/testMultiPage.docx',
            context: 'context',
            versions: [
                {
                    multiPage,
                    sizes: [
                        {
                            size: 800,
                            output,
                            name: 'big'
                        }
                    ]
                }
            ]
        };

        await consumeResponse(config, (msg, channel) => {
            channel.ack(msg);
            const {
                responses: [responses]
            } = JSON.parse(msg.content.toString());

            expect(responses).toEqual(
                expect.objectContaining({
                    error: 0,
                    params: expect.objectContaining({
                        size: msgSend.versions[0].sizes[0].size
                    })
                })
            );
            expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();
            expect(fs.existsSync(path.join(config.outputRootPath, multiPage, '01.pdf'))).toBeTruthy();

            channel.close();

            done();
        });

        await sendTestMessage(config, msgSend);
    });
});

const sendTestMessage = async (config: IConfig, msg: IMessageConsume) => {
    const {exchange, routingKey} = config.amqp.consume;

    const amqpConfig: Options.Connect = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password
    };

    const channel: Channel = await getChannel(amqpConfig);

    const buffer = Buffer.from(JSON.stringify(msg));
    return channel.publish(exchange, routingKey, buffer);
};

const consumeResponse = async (config: IConfig, consume: (msg: ConsumeMessage, channel: Channel) => void) => {
    const amqpConfig: Options.Connect = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password
    };

    const channel: Channel = await getChannel(amqpConfig);

    return channel.consume(config.amqp.publish.queue, msg => {
        consume(msg, channel);
    });
};
