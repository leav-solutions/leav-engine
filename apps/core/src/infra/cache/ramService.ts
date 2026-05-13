import {type ICacheService, type IStoreDataParams} from './cacheService';
import {chunk} from 'lodash';
import {type RedisClientType} from './redis';
import {type RedisArgument} from 'redis';

export default function (redisClient: RedisClientType): ICacheService {
    const WILDCARD_REGEX = /[\*\?\[\]]/;

    const deleteBatchSize = 1000;
    const scanBatchSize = 1000;

    return {
        async storeData({key, data, expiresIn}: IStoreDataParams): Promise<void> {
            await redisClient.SET(key, data, {PX: expiresIn});
        },
        async getData(keys: string[]): Promise<string[]> {
            return redisClient.MGET(keys) as Promise<string[]>;
        },
        async deleteData(keys: string[]): Promise<void> {
            if (!keys?.length) {
                return;
            }

            // Separate exact keys from patterns to avoid scanning for exact deletions
            const exactKeys: string[] = [];
            const patternKeys: string[] = [];
            for (const k of keys) {
                (WILDCARD_REGEX.test(k) ? patternKeys : exactKeys).push(k);
            }

            // Delete exact keys in chunks (run batches in parallel to reduce RTT)
            if (exactKeys.length) {
                const deletionBatches = chunk(exactKeys, deleteBatchSize).map(batch => redisClient.DEL(batch));
                await Promise.all(deletionBatches);
            }

            // For pattern keys, scan and delete matches in batches
            if (patternKeys.length) {
                await Promise.all(
                    patternKeys.map(async pattern => {
                        for await (const delKeys of redisClient.scanIterator({
                            MATCH: pattern,
                            TYPE: 'string',
                            COUNT: scanBatchSize,
                        })) {
                            if (delKeys.length === 0) {
                                continue;
                            }
                            await redisClient.DEL(delKeys as RedisArgument[]);
                        }
                    }),
                );
            }
        },
        async deleteAll(): Promise<void> {
            await redisClient.FLUSHDB();
        },
    };
}
