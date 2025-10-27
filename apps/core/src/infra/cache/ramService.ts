// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ICacheService, type IStoreDataParams} from './cacheService';
import {chunk} from 'lodash';
import {type RedisClientType} from './redis';

export default function (redisClient: RedisClientType): ICacheService {
    const WILDCARD_REGEX = /[\*\?\[\]]/;

    const deleteBatchSize = 1000;
    const scanBatchSize = 1000;

    return {
        async storeData({key, data, expiresIn}: IStoreDataParams): Promise<void> {
            await redisClient.SET(key, data, {PX: expiresIn});
        },
        async getData(keys: string[]): Promise<string[]> {
            return redisClient.MGET(keys);
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
                        let cursor = 0;
                        do {
                            const res = await redisClient.SCAN(cursor, {MATCH: pattern, COUNT: scanBatchSize});
                            cursor = res.cursor;
                            if (res.keys?.length) {
                                // Prefer UNLINK when available; chunk to avoid very large payloads
                                const patternDeletionPromises = chunk(res.keys, deleteBatchSize).map(batch =>
                                    redisClient.DEL(batch)
                                );
                                await Promise.all(patternDeletionPromises);
                            }
                        } while (cursor !== 0);
                    })
                );
            }
        },
        async deleteAll(): Promise<void> {
            await redisClient.FLUSHDB();
        }
    };
}
