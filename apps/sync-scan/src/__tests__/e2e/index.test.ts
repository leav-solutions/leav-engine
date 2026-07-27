import {createAmqpConnection, type IAmqpChannel} from '@leav/message-broker';
import fs from 'fs';
import automate, {extractChildrenDbElements} from '../../automate';
import {getConfig} from '../../config';
import * as scan from '../../scan';
import {type IConfig} from '../../_types/config';
import {type FilesystemContent} from '../../_types/filesystem';
import {type IDbScanResult} from '../../_types/queries';
import test3Db from './database/test3';
import test4Db from './database/test4';

let cfg: IConfig;
// Production-side, producer only - passed into automate() same way index.ts would.
let eventsChannel: IAmqpChannel;
// Test-side, asserts/binds the test queue itself to observe what gets published.
let testConsumerChannel: IAmqpChannel;
let inodes: {[ino: string]: any};

const DB_SETTINGS = {
    filesLibraryId: 'files_library_id',
    directoriesLibraryId: 'directories_library_id',
};

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await getConfig();

        const connection = createAmqpConnection({connOpt: cfg.amqp.connOpt, connectionName: 'sync-scan-test'});
        eventsChannel = connection.createChannel({
            name: 'sync-scan:events',
            setup: async t => {
                await t.assertExchange(cfg.amqp.exchange, cfg.amqp.type, {durable: true});
            },
        });

        const testConnection = createAmqpConnection({
            connOpt: cfg.amqp.connOpt,
            connectionName: 'sync-scan-test-consumer',
        });
        testConsumerChannel = testConnection.createChannel({
            name: 'test:consumer',
            confirm: false,
            setup: async t => {
                await t.assertQueue(cfg.amqp.queue, {durable: true});
                await t.bindQueue(cfg.amqp.queue, cfg.amqp.exchange, cfg.amqp.routingKey);
            },
        });

        // Create filesystem directory
        if (!fs.existsSync(cfg.filesystem.absolutePath)) {
            fs.mkdirSync(cfg.filesystem.absolutePath);
        }
    } catch (e) {
        console.error(e);
    }
});

afterAll(async () => {
    try {
        await eventsChannel.close();
        await testConsumerChannel.close();

        // Delete filesystem directory
        if (fs.existsSync(cfg.filesystem.absolutePath)) {
            fs.rmdirSync(cfg.filesystem.absolutePath, {recursive: true});
        }
    } catch (e) {
        console.error(e);
    }
});

describe('e2e tests', () => {
    test('1 - filesystem creation', () => {
        expect.assertions(5);

        // Create two directories: dir/sdir from root
        fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir`);
        fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir/sdir`);

        // Create three files with differents paths
        [
            `${cfg.filesystem.absolutePath}/file`,
            `${cfg.filesystem.absolutePath}/dir/sfile`,
            `${cfg.filesystem.absolutePath}/dir/sdir/ssfile`,
        ].forEach(p => fs.writeFileSync(p, ''));

        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sdir`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/file`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sfile`)).toEqual(true);
        expect(fs.existsSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`)).toEqual(true);

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
        try {
            expect.assertions(10);

            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: IDbScanResult = {
                ...DB_SETTINGS,
                treeContent: [],
            };

            const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

            const expected = {
                // pathAfter as keys
                dir: 'CREATE',
                file: 'CREATE',
                'dir/sdir': 'CREATE',
                'dir/sfile': 'CREATE',
                'dir/sdir/ssfile': 'CREATE',
            };

            let resolveAll: () => void;
            const gotAll = new Promise<void>(resolve => {
                resolveAll = resolve;
            });

            // Register (and fully await) the consumer before publishing: otherwise messages
            // already sitting in the queue can be delivered in a burst right as the consumer
            // registers, before cancel() below has a chance to take effect.
            await testConsumerChannel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathAfter]));
                    expect(expected[m.pathAfter]).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        await testConsumerChannel.cancel('test3');
                        resolveAll();
                    }
                },
                {consumerTag: 'test3'},
            );

            await automate(fsc, dbScan, DB_SETTINGS, eventsChannel);

            await gotAll;
        } catch (e) {
            console.error(e);
        }
    });

    test('3 - move/rename/edit events', async () => {
        try {
            expect.assertions(10);

            fs.renameSync(`${cfg.filesystem.absolutePath}/file`, `${cfg.filesystem.absolutePath}/dir/file`); // MOVE
            fs.renameSync(`${cfg.filesystem.absolutePath}/dir/sfile`, `${cfg.filesystem.absolutePath}/dir/sf`); // RENAME
            fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`, 'content\n'); // EDIT CONTENT

            const fsc: FilesystemContent = await scan.filesystem(cfg);

            const dbs: IDbScanResult = {
                ...DB_SETTINGS,
                treeContent: test3Db(inodes),
            };

            const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

            const expected = {
                // pathBefore as keys
                file: {pathAfter: 'dir/file', event: 'MOVE'},
                'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'},
                'dir/sdir/ssfile': {pathAfter: 'dir/sdir/ssfile', event: 'UPDATE'},
            };

            let resolveAll: () => void;
            const gotAll = new Promise<void>(resolve => {
                resolveAll = resolve;
            });

            await testConsumerChannel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
                    expect(expected[m.pathBefore].event).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        expect('f75b8179e4bbe7e2b4a074dcef62de95').toEqual(m.hash);
                        await testConsumerChannel.cancel('test4');
                        resolveAll();
                    }
                },
                {consumerTag: 'test4'},
            );

            await automate(fsc, dbScan, DB_SETTINGS, eventsChannel);

            await gotAll;
        } catch (e) {
            console.error(e);
        }
    });

    test('4 - delete events', async () => {
        try {
            expect.assertions(10);

            fs.rmdirSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true});

            const fsc: FilesystemContent = await scan.filesystem(cfg);

            const dbs: IDbScanResult = {
                ...DB_SETTINGS,
                treeContent: test4Db(inodes),
            };

            const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

            const expected = {
                // pathBefore as keys
                dir: 'REMOVE',
                'dir/sdir': 'REMOVE',
                'dir/f': 'REMOVE',
                'dir/sf': 'REMOVE',
                'dir/sdir/ssfile': 'REMOVE',
            };

            let resolveAll: () => void;
            const gotAll = new Promise<void>(resolve => {
                resolveAll = resolve;
            });

            await testConsumerChannel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore]).toEqual(m.event);
                    if (m.pathBefore === 'dir/sdir/ssfile') {
                        await testConsumerChannel.cancel('test5');
                        resolveAll();
                    }
                },
                {consumerTag: 'test5'},
            );

            await automate(fsc, dbScan, DB_SETTINGS, eventsChannel);

            await gotAll;
        } catch (e) {
            console.error(e);
        }
    });
});
