import * as amqp from 'amqplib';
import fs from 'fs';
import * as rmq from '../rmq';
import {RMQConn} from '../_types/rmq';
import {Config} from '../_types/config';
import {FullTreeContent} from '../_types/queries';
import {FilesystemContent} from '../_types/filesystem';
import config from '../config';
import * as scan from '../scan';
import automate from '../automate';
import test2Db from './database/test2';

let conf: Config;
let rmqConn: RMQConn;
let inodes: number[];

beforeAll(async () => {
    conf = await config;

    // RabbitMQ initialization
    const connOpt: amqp.Options.Connect = conf.rmq.connOpt;
    const {exchange, queue, routingKey, type} = conf.rmq;
    rmqConn = await rmq.init(connOpt, exchange, queue, routingKey, type);
});

describe('integration tests sync-scan', () => {
    test('check filesystem is empty', () => {
        expect.assertions(1);
        return expect(scan.filesystem()).resolves.toHaveLength(0);
    });

    test('filesystem creation', () => {
        expect.assertions(5);

        // Create two directories: dir/sdir from root
        fs.mkdirSync(`${conf.filesystem.absolutePath}/dir`);
        fs.mkdirSync(`${conf.filesystem.absolutePath}/dir/sdir`);

        // Create three files with differents paths
        [
            `${conf.filesystem.absolutePath}/file`,
            `${conf.filesystem.absolutePath}/dir/sfile`,
            `${conf.filesystem.absolutePath}/dir/sdir/ssfile`
        ].forEach(p => fs.writeFileSync(p, Math.random()));

        expect(fs.existsSync(`${conf.filesystem.absolutePath}/dir`)).toEqual(true);
        expect(fs.existsSync(`${conf.filesystem.absolutePath}/dir/sdir`)).toEqual(true);
        expect(fs.existsSync(`${conf.filesystem.absolutePath}/file`)).toEqual(true);
        expect(fs.existsSync(`${conf.filesystem.absolutePath}/dir/sfile`)).toEqual(true);
        expect(fs.existsSync(`${conf.filesystem.absolutePath}/dir/sdir/ssfile`)).toEqual(true);

        inodes = [
            fs.statSync(`${conf.filesystem.absolutePath}/dir`).ino,
            fs.statSync(`${conf.filesystem.absolutePath}/dir/sdir`).ino,
            fs.statSync(`${conf.filesystem.absolutePath}/file`).ino,
            fs.statSync(`${conf.filesystem.absolutePath}/dir/sfile`).ino,
            fs.statSync(`${conf.filesystem.absolutePath}/dir/sdir/ssfile`).ino
        ];
    });

    test('initialization/creation events', async done => {
        expect.assertions(10);

        const fsc: FilesystemContent = await scan.filesystem();
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
            conf.rmq.queue,
            async msg => {
                // console.log(msg.content.toString());
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

        // channel.close(() => undefined);
    });

    test('move/rename/edit events', async done => {
        expect.assertions(6);

        fs.renameSync(`${conf.filesystem.absolutePath}/file`, `${conf.filesystem.absolutePath}/dir/f`); // MOVE
        fs.renameSync(`${conf.filesystem.absolutePath}/dir/sfile`, `${conf.filesystem.absolutePath}/dir/sf`); // RENAME
        // TODO: fs.writeFileSync(`${conf.filesystem.absolutePath}/dir/sdir/ssfile`, Math.random()); // EDIT

        const fsc: FilesystemContent = await scan.filesystem();
        const dbs: FullTreeContent = test2Db(inodes);

        await automate(fsc, dbs, rmqConn.channel);

        const expected = {
            // pathBefore as keys
            file: {pathAfter: 'dir/f', event: 'MOVE'},
            'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'}
            // TODO:    'dir/sdir/ssfile': {pathBefore: 'dir/sdir/ssfile', event: 'MOVE'}
        };

        rmqConn.channel.consume(
            conf.rmq.queue,
            async msg => {
                const m = JSON.parse(msg.content);
                expect(Object.keys(expected)).toEqual(expect.arrayContaining([m.pathBefore]));
                expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
                expect(expected[m.pathBefore].event).toEqual(m.event);
                if (m.pathAfter === 'dir/sf') {
                    await rmqConn.channel.cancel('test2');
                    done();
                }
            },
            {consumerTag: 'test2', noAck: true}
        );
    });

    test('delete events', () => {
        console.log('test');
    });
});
