// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as redis from 'redis';
import {type IConfig} from '../../_types/config';

interface IDeps {
    config?: IConfig;
}

export type RedisClientType = ReturnType<typeof redis.createClient>;

export interface IRedis {
    cache: RedisClientType;
    session: RedisClientType;
}

export async function initRedis({config}: IDeps): Promise<IRedis> {
    const _newClient = async (database: number): Promise<RedisClientType> => {
        const client = redis.createClient({
            socket: {
                host: config.redis.host,
                port: config.redis.port,
            },
            database,
        });

        client.on('error', err => {
            throw new Error(`Redis Client Error ${err}`);
        });

        await client.connect();

        return client;
    };

    return {
        cache: await _newClient(config.redis.cacheDatabase),
        session: await _newClient(config.redis.sessionDatabase),
    };
}
