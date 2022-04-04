// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as redis from 'redis';
import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export type RedisClientType = ReturnType<typeof redis.createClient>;

export async function initRedis({config}: IDeps): Promise<RedisClientType> {
    const client = redis.createClient({
        socket: {
            host: config.redis.host,
            port: config.redis.port
        }
    });

    client.on('error', err => {
        throw new Error(`Redis Client Error ${err}`);
    });

    await client.connect();

    return client;
}
