import fs from 'fs';
import * as rmq from '../rmq';
import {RMQConn} from '../_types/rmq';
import {FullTreeContent} from '../_types/queries';
import {FilesystemContent} from '../_types/filesystem';
import * as scan from '../scan';
import automate from '../automate';
import test2Db from './database/test2';
import test3Db from './database/test3';
import config from '../config';
import {Config} from '../_types/config';
import dotenv from 'dotenv';
import {resolve} from 'path';
dotenv.config({path: resolve(__dirname, `../../.env.${process.env.NODE_ENV}`)});

let cfg: Config;
let rmqConn: RMQConn;
let inodes: number[];

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await config;
        rmqConn = await rmq.init(cfg);
    } catch (e) {
        throw e;
    }
});

describe('integration tests sync-scan', () => {
    test('check filesystem is empty', () => {
        expect.assertions(1);
        return expect(scan.filesystem(cfg)).resolves.toHaveLength(0);
    });

    test('filesystem creation', () => {
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

    test('initialization/creation events', async done => {
        expect.assertions(10);

        try {
            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: FullTreeContent = [];

            await automate(fsc, dbs, rmqConn.channel);

            const expected = {
                // pathAfter as keys
                dir: 'CREATE',
                file: 'CREATE',
                'dir/sdir': 'CREATE',
                'dir/sfile': 'CREATE',
                'dir/sdir/ssfile': 'CREATE'
            };

            await rmqConn.channel.consume(
                cfg.rmq.queue,
                async msg => {
                    const m = JSON.parse(msg.content);
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathAfter]));
                    expect(expected[m.pathAfter]).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        await rmqConn.channel.cancel('test1');
                        done();
                    }
                },
                {consumerTag: 'test1', noAck: true}
            );
        } catch (e) {
            throw e;
        }
    });

    test('move/rename/edit events', async done => {
        expect.assertions(10);

        fs.renameSync(`${cfg.filesystem.absolutePath}/file`, `${cfg.filesystem.absolutePath}/dir/f`); // MOVE
        fs.renameSync(`${cfg.filesystem.absolutePath}/dir/sfile`, `${cfg.filesystem.absolutePath}/dir/sf`); // RENAME
        fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/sdir/ssfile`, 'content\n'); // EDIT CONTENT

        try {
            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: FullTreeContent = test2Db(inodes);

            await automate(fsc, dbs, rmqConn.channel);

            const expected = {
                // pathBefore as keys
                file: {pathAfter: 'dir/f', event: 'MOVE'},
                'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'},
                'dir/sdir/ssfile': {pathAfter: 'dir/sdir/ssfile', event: 'UPDATE'}
            };

            rmqConn.channel.consume(
                cfg.rmq.queue,
                async msg => {
                    const m = JSON.parse(msg.content);
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
                    expect(expected[m.pathBefore].event).toEqual(m.event);
                    if (m.pathAfter === 'dir/sdir/ssfile') {
                        expect('f75b8179e4bbe7e2b4a074dcef62de95').toEqual(m.hash);
                        await rmqConn.channel.cancel('test2');
                        done();
                    }
                },
                {consumerTag: 'test2', noAck: true}
            );
        } catch (e) {
            throw e;
        }
    });

    test('delete events', async done => {
        expect.assertions(10);

        fs.rmdirSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true});

        try {
            const fsc: FilesystemContent = await scan.filesystem(cfg);
            const dbs: FullTreeContent = test3Db(inodes);

            await automate(fsc, dbs, rmqConn.channel);

            const expected = {
                // pathBefore as keys
                dir: 'REMOVE',
                'dir/sdir': 'REMOVE',
                'dir/f': 'REMOVE',
                'dir/sf': 'REMOVE',
                'dir/sdir/ssfile': 'REMOVE'
            };

            rmqConn.channel.consume(
                cfg.rmq.queue,
                async msg => {
                    const m = JSON.parse(msg.content);
                    expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                    expect(expected[m.pathBefore]).toEqual(m.event);
                    if (m.pathBefore === 'dir/sdir/ssfile') {
                        await rmqConn.channel.cancel('test3');
                        done();
                    }
                },
                {consumerTag: 'test3', noAck: true}
            );
        } catch (e) {
            throw e;
        }
    });

    afterAll(async done => {
        try {
            await rmqConn.connection.close();
            done();
        } catch (e) {
            throw e;
        }
    });
});
