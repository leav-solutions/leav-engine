import {createAmqpConnection, type IAmqpChannel, type IAmqpConnection} from '@leav/message-broker';
import fs from 'fs';
import automate, {extractChildrenDbElements} from '../../automate';
import {getConfig} from '../../config';
import * as scan from '../../scan';
import {type IConfig} from '../../_types/config';
import {type IEventMsg} from '../../_types/events';
import {type FilesystemContent} from '../../_types/filesystem';
import {type IDbScanResult} from '../../_types/queries';
import test3Db from './database/test3';
import test4Db from './database/test4';

let cfg: IConfig;
let connection: IAmqpConnection;
// Production-side, producer only - passed into automate() same way index.ts would.
let eventsChannel: IAmqpChannel;
// Test-side, asserts/binds the test queue itself to observe what gets published.
let testConsumerChannel: IAmqpChannel;
let inodes: {[ino: string]: any};

const DB_SETTINGS = {
    filesLibraryId: 'files_library_id',
    directoriesLibraryId: 'directories_library_id',
};

// Deliberately shorter than the suite's testTimeout: this way a missing message fails with the
// messages actually received instead of a bare "Test timed out", and the consumer still gets
// cancelled (a vitest timeout abandons the test promise, so no `finally` would run).
const MESSAGES_TIMEOUT_MS = 10_000;

beforeAll(async () => {
    cfg = await getConfig();

    connection = createAmqpConnection({connOpt: cfg.amqp.connOpt, connectionName: 'sync-scan-test'});

    eventsChannel = connection.createChannel({
        name: 'sync-scan:events',
        setup: async t => {
            await t.assertExchange(cfg.amqp.exchange, cfg.amqp.type, {durable: true});
        },
    });

    testConsumerChannel = connection.createChannel({
        name: 'test:consumer',
        confirm: false,
        // The exchange is asserted here too (idempotent, same arguments): channel setups run
        // concurrently, so relying on the producer channel to create it first would make bindQueue
        // race against a not-yet-existing exchange - a 404, which amqp-connection-manager treats as
        // irrecoverable, leaving this channel closed for good.
        setup: async t => {
            await t.assertExchange(cfg.amqp.exchange, cfg.amqp.type, {durable: true});
            await t.assertQueue(cfg.amqp.queue, {durable: true});
            await t.bindQueue(cfg.amqp.queue, cfg.amqp.exchange, cfg.amqp.routingKey);
        },
    });

    // Start from a clean fixtures directory: a previously interrupted run leaves files behind, and
    // test 1 would then fail on mkdir EEXIST.
    fs.rmSync(cfg.filesystem.absolutePath, {recursive: true, force: true});
    fs.mkdirSync(cfg.filesystem.absolutePath, {recursive: true});
});

beforeEach(async () => {
    // Doubles as a barrier: purgeQueue() waits for the channel's first connect, so the queue is
    // asserted AND bound to the exchange before automate() publishes anything - otherwise, on a
    // broker where that topology doesn't exist yet (every CI run gets a fresh RabbitMQ), the events
    // are published to a binding-less exchange and silently dropped.
    // It also drops messages a previous failed run may have left in this durable queue.
    await testConsumerChannel.purgeQueue(cfg.amqp.queue);
});

afterAll(async () => {
    // Closing the connection closes its channels too (and in the right order).
    await connection?.close();

    fs.rmSync(cfg.filesystem.absolutePath, {recursive: true, force: true});
});

/**
 * Consume exactly `count` messages off the test queue and return them, so assertions can run in the
 * test body: an expect() thrown inside a consume handler is caught by the message broker lib (logged
 * + nack), which turns a wrong payload into an opaque timeout instead of a diff.
 */
const collectMessages = async (count: number): Promise<IEventMsg[]> => {
    const received: IEventMsg[] = [];

    let resolveAll: () => void;
    const gotAll = new Promise<void>(resolve => {
        resolveAll = resolve;
    });

    const consumerTag = await testConsumerChannel.consume(cfg.amqp.queue, async msg => {
        received.push(JSON.parse(msg.content.toString()));

        if (received.length >= count) {
            resolveAll();
        }
    });

    let timer: NodeJS.Timeout;

    try {
        await Promise.race([
            gotAll,
            new Promise<never>((_, reject) => {
                timer = setTimeout(
                    () =>
                        reject(
                            new Error(
                                `Expected ${count} AMQP messages, got ${received.length} after ${MESSAGES_TIMEOUT_MS}ms: ${JSON.stringify(received)}`,
                            ),
                        ),
                    MESSAGES_TIMEOUT_MS,
                );
            }),
        ]);
    } finally {
        clearTimeout(timer);
        // A consumer left behind would steal the next test's messages: RabbitMQ round-robins
        // deliveries between all the consumers registered on a queue.
        await testConsumerChannel.cancel(consumerTag);
    }

    return received;
};

const eventByPathAfter = (messages: IEventMsg[]) => Object.fromEntries(messages.map(m => [m.pathAfter, m.event]));

const eventByPathBefore = (messages: IEventMsg[]) => Object.fromEntries(messages.map(m => [m.pathBefore, m.event]));

describe('e2e tests', () => {
    test('1 - filesystem creation', () => {
        // Create two directories: dir/sdir from root
        fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir`);
        fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir/sdir`);

        // Create three files with differents paths
        [
            `${cfg.filesystem.absolutePath}/file`,
            `${cfg.filesystem.absolutePath}/dir/sfile`,
            `${cfg.filesystem.absolutePath}/dir/sdir/ssfile`,
        ].forEach(p => fs.writeFileSync(p, ''));

        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir`)).toBe(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sdir`)).toBe(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/file`)).toBe(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sfile`)).toBe(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`)).toBe(true);

        inodes = [
            {
                ino: fs.statSync(`${cfg.filesystem.absolutePath}/dir`).ino,
                children: [
                    {
                        ino: fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir`).ino,
                        children: [{ino: fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`).ino}],
                    },
                    {ino: fs.statSync(`${cfg.filesystem.absolutePath}/dir/sfile`).ino},
                ],
            },
            {ino: fs.statSync(`${cfg.filesystem.absolutePath}/file`).ino},
        ];
    });

    test('2 - initialization/creation events', async () => {
        const fsc: FilesystemContent = await scan.filesystem(cfg);
        const dbs: IDbScanResult = {
            ...DB_SETTINGS,
            treeContent: [],
        };

        const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

        const [messages] = await Promise.all([collectMessages(5), automate(fsc, dbScan, DB_SETTINGS, eventsChannel)]);

        expect(eventByPathAfter(messages)).toEqual({
            dir: 'CREATE',
            file: 'CREATE',
            'dir/sdir': 'CREATE',
            'dir/sfile': 'CREATE',
            'dir/sdir/ssfile': 'CREATE',
        });
    });

    test('3 - move/rename/edit events', async () => {
        fs.renameSync(`${cfg.filesystem.absolutePath}/file`, `${cfg.filesystem.absolutePath}/dir/file`); // MOVE
        fs.renameSync(`${cfg.filesystem.absolutePath}/dir/sfile`, `${cfg.filesystem.absolutePath}/dir/sf`); // RENAME
        fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`, 'content\n'); // EDIT CONTENT

        const fsc: FilesystemContent = await scan.filesystem(cfg);
        const dbs: IDbScanResult = {
            ...DB_SETTINGS,
            treeContent: test3Db(inodes),
        };

        const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

        const [messages] = await Promise.all([collectMessages(3), automate(fsc, dbScan, DB_SETTINGS, eventsChannel)]);

        expect(Object.fromEntries(messages.map(m => [m.pathBefore, {pathAfter: m.pathAfter, event: m.event}]))).toEqual(
            {
                file: {pathAfter: 'dir/file', event: 'MOVE'},
                'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'},
                'dir/sdir/ssfile': {pathAfter: 'dir/sdir/ssfile', event: 'UPDATE'},
            },
        );
        expect(messages.find(m => m.pathAfter === 'dir/sdir/ssfile').hash).toBe('f75b8179e4bbe7e2b4a074dcef62de95');
    });

    test('4 - delete events', async () => {
        fs.rmSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true, force: true});

        const fsc: FilesystemContent = await scan.filesystem(cfg);
        const dbs: IDbScanResult = {
            ...DB_SETTINGS,
            treeContent: test4Db(inodes),
        };

        const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

        const [messages] = await Promise.all([collectMessages(5), automate(fsc, dbScan, DB_SETTINGS, eventsChannel)]);

        expect(eventByPathBefore(messages)).toEqual({
            dir: 'REMOVE',
            'dir/sdir': 'REMOVE',
            'dir/f': 'REMOVE',
            'dir/sf': 'REMOVE',
            'dir/sdir/ssfile': 'REMOVE',
        });
    });
});
