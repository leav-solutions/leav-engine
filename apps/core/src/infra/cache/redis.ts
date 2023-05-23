// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as redis from 'redis';
import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export type RedisClientType = ReturnType<typeof redis.createClient>;

const LIMIT_TRIES_RECONNECT = 3;

export async function initRedis({config}: IDeps): Promise<RedisClientType> {
    let retries = 0;

    const client = redis.createClient({
        socket: {
            host: config.redis.host,
            port: config.redis.port
        },
        database: config.redis.database
    });

    client.on('ready', () => {
        retries = 0;
    });

    client.on('error', err => {
        console.error(`Redis client error ${err}`);
    });

    client.on('reconnecting', async () => {
        if (retries++ < LIMIT_TRIES_RECONNECT) {
            console.info(`Redis client is trying to reconnect to the server (${retries} tries)`);
        } else {
            console.info(`Redis client: ${LIMIT_TRIES_RECONNECT} failed reconnection attempts, quitting...`);
            await client.disconnect();
        }
    });

    await client.connect();

    return client;
}
