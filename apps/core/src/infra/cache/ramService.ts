// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import {ICacheService, IStoreDataParams} from './cacheService';
import {RedisClientType} from './redis';

interface IDeps {
    config?: IConfig;
    'core.infra.redis'?: RedisClientType;
}

export default function ({config = null, 'core.infra.redis': redis = null}: IDeps): ICacheService {
    return {
        async storeData({key, data, expiresIn}: IStoreDataParams): Promise<void> {
            await redis.SET(key, data, {PX: expiresIn});
        },
        async getData(keys: string[]): Promise<string[]> {
            return redis.MGET(keys);
        },
        async deleteData(keys: string[]): Promise<void> {
            for (const k of keys) {
                let cursor = 0;

                do {
                    const res = await redis.SCAN(cursor, {MATCH: k});
                    cursor = res.cursor;
                    if (res.keys.length) {
                        await redis.DEL(res.keys);
                    }
                } while (cursor !== 0);
            }
        },
        async deleteAll(): Promise<void> {
            await redis.FLUSHDB();
        }
    };
}
