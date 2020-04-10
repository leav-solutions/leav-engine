import dotenv from 'dotenv';
import {resolve} from 'path';
import fs from 'fs';
import config from '../../config';
import {Config} from '../../_types/config';
import * as rmq from '../../rmq';
import {RMQConn} from '../../_types/rmq';
import * as scan from '../../scan';
dotenv.config({path: resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`)});

let cfg: Config;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await config;
    } catch (e) {
        throw e;
    }
});

afterAll(() => {
    fs.rmdirSync(`${cfg.filesystem.absolutePath}/dir`, {recursive: true});
});

describe('unit tests sync-scan', () => {
    test('check filesystem is empty', () => {
        expect.assertions(1);
        return expect(scan.filesystem(cfg.filesystem.absolutePath)).resolves.toHaveLength(0);
    });

    test('RMQ initialization', async () => {
        try {
            expect.assertions(5);
            const rmqConn: RMQConn = await rmq.init(cfg);

            expect(typeof rmqConn.connection).toBe('object');
            expect(typeof rmqConn.channel).toBe('object');

            await expect(rmqConn.channel.checkExchange(cfg.rmq.exchange)).resolves.toStrictEqual({});
            await expect(rmqConn.channel.checkQueue(cfg.rmq.queue)).resolves.toStrictEqual({
                consumerCount: 0,
                messageCount: 0,
                queue: cfg.rmq.queue
            });

            await expect(rmqConn.connection.close()).resolves.toStrictEqual(undefined);
        } catch (e) {
            console.error(e);
        }
    });

    test('Scan filesystem', async () => {
        try {
            expect.assertions(5);
            await expect(scan.filesystem('wrong path')).rejects.toEqual('Wrong filesystem absolute path');
            await expect(scan.filesystem(cfg.filesystem.absolutePath)).resolves.toHaveLength(0);

            fs.mkdirSync(`${cfg.filesystem.absolutePath}/dir`);
            fs.writeFileSync(`${cfg.filesystem.absolutePath}/dir/file`, '');

            const res = await scan.filesystem(cfg.filesystem.absolutePath);
            expect(res.length).toBe(2);

            expect({...res[0]}).toStrictEqual({
                ...fs.statSync(`${cfg.filesystem.absolutePath}/dir`),
                name: 'dir',
                type: 'directory',
                path: '.',
                level: 0,
                trt: false
            });

            expect({...res[1]}).toStrictEqual({
                ...fs.statSync(`${cfg.filesystem.absolutePath}/dir/file`),
                name: 'file',
                type: 'file',
                hash: 'd41d8cd98f00b204e9800998ecf8427e',
                path: 'dir',
                level: 1,
                trt: false
            });
        } catch (e) {
            console.error(e);
        }
    });

    // test('Scan Databse', () => {});
});
