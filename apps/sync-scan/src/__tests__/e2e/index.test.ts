// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService, IAmqpService} from '@leav/message-broker';
import fs from 'fs';
import automate, {extractChildrenDbElements} from '../../automate';
import {getConfig} from '../../config';
import * as scan from '../../scan';
import {IConfig} from '../../_types/config';
import {FilesystemContent} from '../../_types/filesystem';
import {IDbScanResult} from '../../_types/queries';
import test3Db from './database/test3';
import test4Db from './database/test4';

let cfg: IConfig;
let amqp: IAmqpService;
let inodes: {[ino: string]: any};

const DB_SETTINGS = {
    filesLibraryId: 'files_library_id',
    directoriesLibraryId: 'directories_library_id'
};

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

jest.setTimeout(20000);

beforeAll(async () => {
    try {
        cfg = await getConfig();

        amqp = await amqpService({config: cfg.amqp});

        // As queue is only used in tests to consume messages, it's not created in amqp.init. Thus, we have to do it here
        await amqp.consumer.channel.assertQueue(cfg.amqp.queue);
        await amqp.consumer.channel.bindQueue(cfg.amqp.queue, cfg.amqp.exchange, cfg.amqp.routingKey);

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
        await amqp.close();

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
            `${cfg.filesystem.absolutePath}/dir/sdir/ssfile`
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
                        children: [{ino: fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`).ino}]
                    },
                    {ino: fs.statSync(`${cfg.filesystem.absolutePath}/dir/sfile`).ino}
                ]
            },
            {ino: fs.statSync(`${cfg.filesystem.absolutePath}/file`).ino}
        ];
    });

    test('2 - initialization/creation events', async done => {
        try {
            expect.assertions(10);

            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: IDbScanResult = {
                ...DB_SETTINGS,
                treeContent: []
            };

            const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

            await automate(fsc, dbScan, DB_SETTINGS, amqp);

            const expected = {
                // pathAfter as keys
                dir: 'CREATE',
                file: 'CREATE',
                'dir/sdir': 'CREATE',
                'dir/sfile': 'CREATE',
                'dir/sdir/ssfile': 'CREATE'
            };

            await amqp.consumer.channel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathAfter]));
                    expect(expected[m.pathAfter]).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        await amqp.consumer.channel.cancel('test3');
                        done();
                    }
                },
                {consumerTag: 'test3', noAck: true}
            );
        } catch (e) {
            console.error(e);
        }
    });

    test('3 - move/rename/edit events', async done => {
        try {
            expect.assertions(10);

            fs.renameSync(`${cfg.filesystem.absolutePath}/file`, `${cfg.filesystem.absolutePath}/dir/file`); // MOVE
            fs.renameSync(`${cfg.filesystem.absolutePath}/dir/sfile`, `${cfg.filesystem.absolutePath}/dir/sf`); // RENAME
            fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`, 'content\n'); // EDIT CONTENT

            const fsc: FilesystemContent = await scan.filesystem(cfg);

            // console.debug(JSON.stringify({inodes}, null, 2));

            const dbs: IDbScanResult = {
                ...DB_SETTINGS,
                treeContent: test3Db(inodes)
            };

            const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);

            await automate(fsc, dbScan, DB_SETTINGS, amqp);

            const expected = {
                // pathBefore as keys
                file: {pathAfter: 'dir/file', event: 'MOVE'},
                'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'},
                'dir/sdir/ssfile': {pathAfter: 'dir/sdir/ssfile', event: 'UPDATE'}
            };

            amqp.consumer.channel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
                    expect(expected[m.pathBefore].event).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        expect('f75b8179e4bbe7e2b4a074dcef62de95').toEqual(m.hash);
                        await amqp.consumer.channel.cancel('test4');
                        done();
                    }
                },
                {consumerTag: 'test4', noAck: true}
            );
        } catch (e) {
            console.error(e);
        }
    });

    test('4 - delete events', async done => {
        try {
            expect.assertions(10);

            fs.rmdirSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true});

            const fsc: FilesystemContent = await scan.filesystem(cfg);

            const dbs: IDbScanResult = {
                ...DB_SETTINGS,
                treeContent: test4Db(inodes)
            };

            const dbScan = extractChildrenDbElements(DB_SETTINGS, dbs.treeContent);
            await automate(fsc, dbScan, DB_SETTINGS, amqp);

            const expected = {
                // pathBefore as keys
                dir: 'REMOVE',
                'dir/sdir': 'REMOVE',
                'dir/f': 'REMOVE',
                'dir/sf': 'REMOVE',
                'dir/sdir/ssfile': 'REMOVE'
            };

            amqp.consumer.channel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore]).toEqual(m.event);
                    if (m.pathBefore === 'dir/sdir/ssfile') {
                        await amqp.consumer.channel.cancel('test5');
                        done();
                    }
                },
                {consumerTag: 'test5', noAck: true}
            );
        } catch (e) {
            console.error(e);
        }
    });
});
