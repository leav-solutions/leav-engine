import dotenv from 'dotenv';
import {resolve} from 'path';
import fs from 'fs';
import config from '../../config';
import {Config} from '../../_types/config';
import * as rmq from '../../rmq';
import {RMQConn} from '../../_types/rmq';
import * as scan from '../../scan';
import * as utils from '../../utils';
import automate from '../../automate';
import autoTestDb from './database/automateTest';
dotenv.config({path: resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`)});

let cfg: Config;
let rmqConn: RMQConn;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        cfg = await config;
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
    test('check filesystem is empty', () => {
        expect.assertions(1);
        return expect(scan.filesystem(cfg.filesystem)).resolves.toHaveLength(0);
    });

    test('rmq.init', async () => {
        try {
            expect.assertions(3);

            await expect(rmqConn.channel.checkExchange(cfg.rmq.exchange)).resolves.toStrictEqual({});

            await expect(
                rmq.init({...cfg.rmq, connOpt: {...cfg.rmq.connOpt, hostname: 'wrong hostname'}})
            ).rejects.toHaveProperty('code', 'ENOTFOUND');

            await expect(
                rmq.init({...cfg.rmq, connOpt: {...cfg.rmq.connOpt, password: 'wrong pwd'}})
            ).rejects.toHaveProperty(
                'message',
                `Handshake terminated by server: 403 (ACCESS-REFUSED) with message "ACCESS_REFUSED - Login was refused using authentication mechanism PLAIN. For details see the broker logfile.\"`
            );
        } catch (e) {
            console.error(e);
        }
    });

    test('scan.filesystem', async () => {
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

    test('utils.createHashFromFile', async () => {
        expect.assertions(3);

        await expect(utils.createHashFromFile('wrong path')).rejects.toHaveProperty('code', 'ENOENT');
        await expect(utils.createHashFromFile(`${cfg.filesystem.absolutePath}/dir/file`)).resolves.toBe(
            'd41d8cd98f00b204e9800998ecf8427e'
        );
        await expect(utils.createHashFromFile(`${cfg.filesystem.absolutePath}/dir`)).rejects.toHaveProperty(
            'code',
            'EISDIR'
        );
    });

    test('scan.database', async () => {
        try {
            expect.assertions(3);

            await expect(
                scan.database({uri: 'wrong uri', token: cfg.graphql.token, treeId: cfg.graphql.treeId})
            ).rejects.toHaveProperty('message', 'Network error: Only absolute URLs are supported');

            await expect(
                scan.database({uri: cfg.graphql.uri, token: 'wrong token', treeId: cfg.graphql.treeId})
            ).rejects.toHaveProperty('message', 'Network error: Response not successful: Received status code 401');

            await expect(
                scan.database({uri: cfg.graphql.uri, token: cfg.graphql.token, treeId: 'wrong treeId'})
            ).rejects.toHaveProperty('message', 'GraphQL error: Validation error');
        } catch (e) {
            console.error(e);
        }
    });

    test('automate', async () => {
        try {
            expect.assertions(2);

            await expect(automate([], [], rmqConn.channel)).resolves.toStrictEqual(undefined);

            const fsScan = await scan.filesystem(cfg.filesystem);
            await expect(automate(fsScan, autoTestDb, rmqConn.channel)).resolves.toStrictEqual(undefined);
        } catch (e) {
            console.error(e);
        }
    });

    test('rmq.generateMsg', () => {
        try {
            expect.assertions(3);

            const msg = JSON.parse(rmq.generateMsg('EVENT', 'path before', 'path after', 1, true, cfg.rmq.rootKey));
            const msgExpected = {
                event: 'EVENT',
                pathAfter: 'path after',
                pathBefore: 'path before',
                isDirectory: true,
                inode: 1,
                rootKey: 'files1'
            };

            expect(msg).toHaveProperty('time');
            expect(typeof msg.time).toBe('number');
            delete msg.time;

            expect(msg).toStrictEqual(msgExpected);
        } catch (e) {
            console.error(e);
        }
    });

    test('msg.send', async () => {
        try {
            expect.assertions(2);

            await expect(rmq.send(cfg.rmq, 'msg', rmqConn.channel)).resolves.toBe(undefined);
            await expect(
                rmq.send({...cfg.rmq, exchange: 'wrong exchange'}, 'msg', rmqConn.channel)
            ).rejects.toHaveProperty('code', 404);

            // FIXME: UNHANDLED ERROR ON PREVIOUS EXPECT, I DON'T KNOW WHY!!!!
        } catch (e) {
            console.error(e);
        }
    });
});
