import fs from 'fs';
import automate from '../../automate';
import {getConfig} from '../../config';
import * as rmq from '../../rmq';
import * as scan from '../../scan';
import {Config} from '../../_types/config';
import {RMQConn} from '../../_types/rmq';

let cfg: Config;
let rmqConn: RMQConn;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await getConfig();
        rmqConn = await rmq.init(cfg.rmq);
    } catch (e) {
        console.error(e);
    }
});

afterAll(async done => {
    try {
        fs.rmdirSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true});
        // FIXME: await rmqConn.channel.purgeQueue(cfg.rmq.queue);
        await rmqConn.connection.close();
        done();
    } catch (e) {
        console.error(e);
    }
});

describe('unit tests sync-scan', () => {
    test('1 - check filesystem is empty', () => {
        expect.assertions(1);
        return expect(scan.filesystem(cfg.filesystem)).resolves.toHaveLength(0);
    });

    test('2 - scan.filesystem', async () => {
        try {
            expect.assertions(5);

            await expect(scan.filesystem({absolutePath: 'wrong path'})).rejects.toEqual(
                'Wrong filesystem absolute path'
            );
            await expect(scan.filesystem(cfg.filesystem)).resolves.toHaveLength(0);

            fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir`);
            fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/file`, '');

            const res = await scan.filesystem(cfg.filesystem);
            expect(res.length).toBe(2);

            expect({...res[0], atimeMs: undefined, atime: undefined}).toStrictEqual({
                ...fs.statSync(`${cfg.filesystem.absolutePath}/dir`),
                name: 'dir',
                type: 'directory',
                path: '.',
                level: 0,
                trt: false,
                atimeMs: undefined,
                atime: undefined
            });

            expect({...res[1], atimeMs: undefined, atime: undefined}).toStrictEqual({
                ...fs.statSync(`${cfg.filesystem.absolutePath}/dir/file`),
                name: 'file',
                type: 'file',
                hash: 'd41d8cd98f00b204e9800998ecf8427e',
                path: 'dir',
                level: 1,
                trt: false,
                atimeMs: undefined,
                atime: undefined
            });
        } catch (e) {
            console.error(e);
        }
    });

    test('3 - automate', async () => {
        try {
            expect.assertions(2);

            await expect(automate([], [], rmqConn.channel)).resolves.toStrictEqual(undefined);

            const fsScan = await scan.filesystem(cfg.filesystem);
            const dbScan = await scan.database(cfg.graphql);
            await expect(automate(fsScan, dbScan, rmqConn.channel)).resolves.toStrictEqual(undefined);
        } catch (e) {
            console.error(e);
        }
    });
});
