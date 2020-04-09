import dotenv from 'dotenv';
import {resolve} from 'path';
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

describe('unit tests sync-scan', () => {
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
        await expect(scan.filesystem('wrong path')).rejects.toEqual('Wrong filesystem absolute path');
    });

    // test('Scan Databse', () => {});
});
