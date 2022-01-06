// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import automate from '../../automate';
import {getConfig} from '../../config';
import * as amqp from '../../amqp';
import * as scan from '../../scan';
import {IConfig} from '../../_types/config';
import {FilesystemContent} from '../../_types/filesystem';
import {FullTreeContent} from '../../_types/queries';
import {IAmqpConn} from '../../_types/amqp';
import test4Db from './database/test4';
import test5Db from './database/test5';

let cfg: IConfig;
let amqpConn: IAmqpConn;
let inodes: number[];

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await getConfig();

        amqpConn = await amqp.init(cfg.amqp);

        // As queue is only used in tests to consume messages, it's not created in amqp.init. Thus, we have to do it here
        await amqpConn.channel.assertQueue(cfg.amqp.queue);
        await amqpConn.channel.bindQueue(cfg.amqp.queue, cfg.amqp.exchange, cfg.amqp.routingKey);

        // Create filesystem directory
        fs.mkdirSync(cfg.filesystem.absolutePath);
    } catch (e) {
        console.error(e);
    }
});

afterAll(async done => {
    try {
        await amqpConn.channel.deleteExchange(cfg.amqp.exchange);
        await amqpConn.channel.deleteQueue(cfg.amqp.queue);

        await amqpConn.connection.close();
        done();
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
            fs.statSync(`${cfg.filesystem.absolutePath}/dir`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/file`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/dir/sfile`).ino,
            fs.statSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`).ino
        ];
    });

    test('2 - initialization/creation events', async done => {
        try {
            expect.assertions(10);

            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: FullTreeContent = [];

            await automate(fsc, dbs, amqpConn.channel);

            const expected = {
                // pathAfter as keys
                dir: 'CREATE',
                file: 'CREATE',
                'dir/sdir': 'CREATE',
                'dir/sfile': 'CREATE',
                'dir/sdir/ssfile': 'CREATE'
            };

            await amqpConn.channel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathAfter]));
                    expect(expected[m.pathAfter]).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        await amqpConn.channel.cancel('test3');
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

            fs.renameSync(`${cfg.filesystem.absolutePath}/file`, `${cfg.filesystem.absolutePath}/dir/f`); // MOVE
            fs.renameSync(`${cfg.filesystem.absolutePath}/dir/sfile`, `${cfg.filesystem.absolutePath}/dir/sf`); // RENAME
            fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`, 'content\n'); // EDIT CONTENT

            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: FullTreeContent = test4Db(inodes);

            await automate(fsc, dbs, amqpConn.channel);

            const expected = {
                // pathBefore as keys
                file: {pathAfter: 'dir/f', event: 'MOVE'},
                'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'},
                'dir/sdir/ssfile': {pathAfter: 'dir/sdir/ssfile', event: 'UPDATE'}
            };

            amqpConn.channel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
                    expect(expected[m.pathBefore].event).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        expect('f75b8179e4bbe7e2b4a074dcef62de95').toEqual(m.hash);
                        await amqpConn.channel.cancel('test4');
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
            const dbs: FullTreeContent = test5Db(inodes);

            await automate(fsc, dbs, amqpConn.channel);

            const expected = {
                // pathBefore as keys
                dir: 'REMOVE',
                'dir/sdir': 'REMOVE',
                'dir/f': 'REMOVE',
                'dir/sf': 'REMOVE',
                'dir/sdir/ssfile': 'REMOVE'
            };

            amqpConn.channel.consume(
                cfg.amqp.queue,
                async msg => {
                    const m = JSON.parse(msg.content.toString());
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore]).toEqual(m.event);
                    if (m.pathBefore === 'dir/sdir/ssfile') {
                        await amqpConn.channel.cancel('test5');
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
