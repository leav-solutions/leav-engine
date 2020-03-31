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

let conf: Config;
let rmqConn: RMQConn;

beforeAll(async () => {
    conf = await config;

    // RabbitMQ initialization
    const connOpt: amqp.Options.Connect = conf.rmq.connOpt;
    const {exchange, queue, routingKey, type} = conf.rmq;
    rmqConn = await rmq.init(connOpt, exchange, queue, routingKey, type);
});

describe('integration tests sync-scan', () => {
    test('scan empty filesystem', () => {
        expect.assertions(1);
        return expect(scan.filesystem()).resolves.toHaveLength(0);
    });

    test('files/directories creation', () => {
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
    });

    test('initialization/creation events', async done => {
        expect.assertions(5);

        const fsc: FilesystemContent = await scan.filesystem();
        const dbs: FullTreeContent = await scan.database();

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
            msg => {
                console.log(msg.content.toString());
                const m = JSON.parse(msg.content);
                if (Object.keys(expected).includes(m.pathAfter)) {
                    expect(expected[m.pathAfter]).toEqual(m.event);
                } else {
                    throw new Error('bad path');
                }
            },
            {noAck: true}
        );

        // channel.close(() => undefined);
        done();
    });

    // test('file/directory move/rename/edit events', async done => {
    //     expect.assertions(2);

    //     fs.renameSync(`${conf.filesystem.absolutePath}/file`, `${conf.filesystem.absolutePath}/dir/f`); // MOVE
    //     fs.renameSync(`${conf.filesystem.absolutePath}/dir/sfile`, `${conf.filesystem.absolutePath}/dir/sf`); // RENAME
    //     // TODO: fs.writeFileSync(`${conf.filesystem.absolutePath}/dir/sdir/ssfile`, Math.random()); // EDIT

    //     const fsc: FilesystemContent = await scan.filesystem();
    //     const dbs: FullTreeContent = await scan.database();

    //     await automate(fsc, dbs, rmqConn.channel);

    //     const expected = {
    //         // pathBefore as keys
    //         file: {pathAfter: 'dir/f', event: 'MOVE'},
    //         'dir/sfile': {pathAfter: 'dir/sf', event: 'MOVE'}
    //         // TODO:    'dir/sdir/ssfile': {pathBefore: 'dir/sdir/ssfile', event: 'MOVE'}
    //     };

    //     rmqConn.channel.consume(
    //         conf.rmq.queue,
    //         msg => {
    //             // console.log(msg.content.toString());
    //             const m = JSON.parse(msg.content);
    //             if (Object.keys(expected).includes(m.pathBefore)) {
    //                 expect(expected[m.pathBefore].pathAfter).toEqual(m.pathAfter);
    //                 expect(expected[m.pathBefore].event).toEqual(m.event);
    //             } else {
    //                 console.log(Object.keys(expected));
    //                 console.log(m.pathBefore);
    //                 throw new Error('bad move');
    //             }

    //             done();
    //             // channel.close(() => undefined);
    //         },
    //         {noAck: true}
    //     );
    // });

    // test('file/directory delete', () => {
    //     console.log('test');
    // });
});
