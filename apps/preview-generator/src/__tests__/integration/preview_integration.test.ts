import {createAmqpConnection, type IAmqpChannel, type IAmqpMessage} from '@leav/message-broker';
import * as fs from 'fs';
import * as path from 'path';
import {getConfig} from '../../getConfig/getConfig';
import {type IConfig, type IMessageConsume} from '../../types/types';

// Quick migration of done callback https://vitest.dev/guide/migration.html#done-callback
// If promise reject, then failure may not be correctly caught.
// But it is a quick way to migrate, and we can improve it later if needed.

describe('test preview generation', () => {
    let config;

    beforeAll(async () => {
        config = await getConfig();
    });

    test('jpg with clip to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);

                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    test('jpg to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);
                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    test('png to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);
                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    test('png with transparent to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);

                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    test('pdf to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);

                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    test('docx to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);
                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    // this test can take time
    test('pdf with multi page to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);
                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();
                expect(fs.existsSync(path.join(config.outputRootPath, multiPage, '01.pdf'))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));

    test('docx with multi page to png', () =>
        new Promise<void>(async done => {
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
                                name: 'big',
                            },
                        ],
                    },
                ],
            };

            await consumeResponse(config, (msg, channel) => {
                channel.ack(msg);
                const {
                    responses: [responses],
                } = JSON.parse(msg.content.toString());

                expect(responses).toEqual(
                    expect.objectContaining({
                        error: 0,
                        params: expect.objectContaining({
                            size: msgSend.versions[0].sizes[0].size,
                        }),
                    }),
                );
                expect(fs.existsSync(path.join(config.outputRootPath, output))).toBeTruthy();
                expect(fs.existsSync(path.join(config.outputRootPath, multiPage, '01.pdf'))).toBeTruthy();

                channel.close();

                done();
            });

            await sendTestMessage(config, msgSend);
        }));
});

const sendTestMessage = async (config: IConfig, msg: IMessageConsume): Promise<void> => {
    const {exchange, routingKey} = config.amqp.consume;

    const connection = createAmqpConnection({
        connOpt: config.amqp.connOpt,
        connectionName: 'preview-generator-test-producer',
    });
    const channel = connection.createChannel({name: 'test:producer'});

    await channel.publish(exchange, routingKey, JSON.stringify(msg), {persistent: true});
};

const consumeResponse = async (
    config: IConfig,
    consume: (msg: IAmqpMessage, channel: IAmqpChannel) => void,
): Promise<void> => {
    const connection = createAmqpConnection({
        connOpt: config.amqp.connOpt,
        connectionName: 'preview-generator-test-consumer',
    });
    const channel = connection.createChannel({name: 'test:consumer', confirm: false});

    await channel.consume(
        config.amqp.publish.queue,
        async msg => {
            consume(msg, channel);
        },
        {manualAck: true},
    );
};
