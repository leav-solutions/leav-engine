import {afterEach, beforeEach, vi} from 'vitest';
import {createAmqpConnection, type IAmqpConnection} from '@leav/message-broker';
import {type FSWatcher} from 'chokidar';
import * as fs from 'fs';
import {startWatch} from '../../setupWatcher/setupWatcher';
import {resetWatchState} from '../../watch/watch';
import {getConfig} from '../../config';
import path from 'path';

const debugLog = false;

describe('integration test automate-scan', () => {
    console.info = vi.fn();

    // Connections opened by the running test, closed in afterEach to avoid zombie connections
    // (e.g. when a test fails before its consumer received a message).
    let watcher: FSWatcher | undefined;
    let consumerConnection: IAmqpConnection | undefined;

    beforeEach(async () => {
        const config = await getConfig();

        // Start each test from a clean fixtures directory so leftover files don't pollute the scan.
        fs.rmSync(config.rootPath, {recursive: true, force: true});
        fs.mkdirSync(config.rootPath, {recursive: true});

        // Clear pending timers and inode/path maps leaking from a previous test.
        resetWatchState();

        // Drop any stale/delayed message still sitting in the shared durable queue.
        await purgeQueue();
    });

    afterEach(async () => {
        await watcher?.close();
        watcher = undefined;

        await consumerConnection?.close();
        consumerConnection = undefined;

        resetWatchState();
    });

    test('create a file and check if event send to rabbitmq', async () => {
        expect.assertions(2);

        const config = await getConfig();
        const pathTmpFile = config.rootPath + '/file_' + Math.random().toString();

        watcher = await startWatch();
        await waitWatcherReady(watcher);
        debugLog && console.log(new Date(), '[create] Watcher ready');

        // Need the watcher to work
        expect(watcher).toBeDefined();

        await new Promise<void>(async (resolve, reject) => {
            await initRabbitMQ(msg => {
                debugLog && console.log(new Date(), '[create] Message received from RabbitMQ:', msg);
                expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('CREATE'));
                resolve();
            }).catch(reject);

            debugLog && console.log(new Date(), '[create] Creating file for test');
            await fs.promises.writeFile(pathTmpFile, Math.random().toString());
        });
    });

    test('update a file and check if event send to rabbitmq', async () => {
        expect.assertions(2);

        const config = await getConfig();
        const pathTmpFile = config.rootPath + '/file_' + Math.random().toString();

        await fs.promises.writeFile(pathTmpFile, Math.random().toString());

        watcher = await startWatch();
        await waitWatcherReady(watcher);
        debugLog && console.log(new Date(), '[update] Watcher ready');

        // Need the watcher to work
        expect(watcher).toBeDefined();

        await new Promise<void>(async (resolve, reject) => {
            await initRabbitMQ(msg => {
                debugLog && console.log(new Date(), '[update] Message received from RabbitMQ:', msg);
                expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('UPDATE'));
                resolve();
            }).catch(reject);

            debugLog && console.log(new Date(), '[update] Updating file for test');
            await fs.promises.writeFile(pathTmpFile, Math.random().toString());
        });
    });

    test('delete a file and check if event send to rabbitmq', async () => {
        expect.assertions(2);

        const config = await getConfig();
        const pathTmpFile = config.rootPath + '/file_' + Math.random().toString();

        await fs.promises.writeFile(pathTmpFile, Math.random().toString());

        watcher = await startWatch();
        await waitWatcherReady(watcher);
        debugLog && console.log(new Date(), '[delete] Watcher ready');

        // Need the watcher to work
        expect(watcher).toBeDefined();

        await new Promise<void>(async (resolve, reject) => {
            await initRabbitMQ(msg => {
                debugLog && console.log(new Date(), '[delete] Message received from RabbitMQ:', msg);
                expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('REMOVE'));
                resolve();
            }).catch(reject);

            debugLog && console.log(new Date(), '[delete] Deleting file for test');
            await fs.promises.unlink(pathTmpFile);
        });
    });

    test('rename a file and check if event send to rabbitmq', async () => {
        expect.assertions(2);

        const config = await getConfig();
        const pathTmpFile = config.rootPath + '/file1_' + Math.random().toString();
        const newPathTmpFile = config.rootPath + '/file2_' + Math.random().toString();

        await fs.promises.writeFile(pathTmpFile, Math.random().toString());

        watcher = await startWatch();
        await waitWatcherReady(watcher);
        debugLog && console.log(new Date(), '[rename] Watcher ready');

        // Need the watcher to work
        expect(watcher).toBeDefined();

        await new Promise<void>(async (resolve, reject) => {
            await initRabbitMQ(msg => {
                debugLog && console.log(new Date(), '[rename] Message received from RabbitMQ:', msg);
                expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('MOVE'));
                resolve();
            }).catch(reject);

            debugLog && console.log(new Date(), '[rename] Renaming file for test');
            await fs.promises.rename(pathTmpFile, newPathTmpFile);
        });
    });

    test('move a file and check if event send to rabbitmq', async () => {
        expect.assertions(2);

        const config = await getConfig();
        const fileName = 'file_' + Math.random().toString();
        const pathTmpFile = config.rootPath + '/' + fileName;
        const newPathTmpFile = config.rootPath + '/1/' + fileName;

        await fs.promises.writeFile(pathTmpFile, Math.random().toString());
        if (!fs.existsSync(path.dirname(newPathTmpFile))) {
            await fs.promises.mkdir(path.dirname(newPathTmpFile));
        }

        watcher = await startWatch();
        await waitWatcherReady(watcher);
        debugLog && console.log(new Date(), '[move] Watcher ready');

        // Need the watcher to work
        expect(watcher).toBeDefined();

        await new Promise<void>(async (resolve, reject) => {
            await initRabbitMQ(msg => {
                debugLog && console.log(new Date(), '[move] Message received from RabbitMQ:', msg);
                expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('MOVE'));
                resolve();
            }).catch(reject);

            debugLog && console.log(new Date(), '[move] Moving file for test');
            await fs.promises.rename(pathTmpFile, newPathTmpFile);
        });
    });

    test('move and rename a file and check if event send to rabbitmq', async () => {
        expect.assertions(2);

        const config = await getConfig();
        const pathTmpFile = config.rootPath + '/file1_' + Math.random().toString();
        const newPathTmpFile = config.rootPath + '/1/file2_' + Math.random().toString();

        await fs.promises.writeFile(pathTmpFile, Math.random().toString());
        if (!fs.existsSync(path.dirname(newPathTmpFile))) {
            await fs.promises.mkdir(path.dirname(newPathTmpFile));
        }

        watcher = await startWatch();
        await waitWatcherReady(watcher);
        debugLog && console.log(new Date(), '[move & rename] Watcher ready');

        // Need the watcher to work
        expect(watcher).toBeDefined();

        await new Promise<void>(async (resolve, reject) => {
            await initRabbitMQ(msg => {
                debugLog && console.log(new Date(), '[move & rename] Message received from RabbitMQ:', msg);
                expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('MOVE'));
                resolve();
            }).catch(reject);

            debugLog && console.log(new Date(), '[move & rename] Moving and renaming file for test');
            await fs.promises.rename(pathTmpFile, newPathTmpFile);
        });
    });

    // Wait for chokidar to finish its initial scan before performing the FS action.
    // Until 'ready' fires, events are treated as init (redis only) and NOT published to RabbitMQ,
    // so acting too early makes the awaited event silently disappear → test timeout.
    const waitWatcherReady = (_watcher: FSWatcher) =>
        new Promise<void>(resolve => {
            _watcher.once('ready', () => resolve());
        });

    const purgeQueue = async () => {
        const config = await getConfig();
        const connection = createAmqpConnection({
            connOpt: config.amqp.connOpt,
            connectionName: 'automate-scan-test-purge',
        });

        try {
            const channel = connection.createChannel({
                name: 'test:purgeQueue',
                confirm: false,
                setup: async t => {
                    await t.assertQueue(config.amqp.queue, {durable: true});
                },
            });
            await channel.purgeQueue(config.amqp.queue);
        } finally {
            await connection.close();
        }
    };

    const initRabbitMQ = async (callback: (msg: string) => void) => {
        const config = await getConfig();

        consumerConnection = createAmqpConnection({
            connOpt: config.amqp.connOpt,
            connectionName: 'automate-scan-test-consumer',
        });
        const channel = consumerConnection.createChannel({
            name: 'test:consumer',
            confirm: false,
            setup: async t => {
                await t.assertQueue(config.amqp.queue, {durable: true});
            },
        });

        await channel.consume(config.amqp.queue, async msg => {
            try {
                callback(msg.content.toString());
            } catch (e) {
                console.error(new Date(), '[RabbitMQ] Error processing message:', e);
            }
        });
    };
});
