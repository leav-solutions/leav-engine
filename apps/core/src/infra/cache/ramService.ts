import {type ICacheService, type IStoreDataParams} from './cacheService';
import {chunk} from 'lodash';
import {type RedisClientType} from 'redis';
import {cacheKeysCountGauge, redisErrorsCounter, redisOperationDuration} from './_metrics';

type RedisOperation = 'get' | 'set' | 'del' | 'flush' | 'dbsize';
type CacheDb = 'cache' | 'session';

export default function (redisClient: RedisClientType, db: CacheDb): ICacheService {
    const WILDCARD_REGEX = /[*?[\]]/;

    const deleteBatchSize = 1000;
    const scanBatchSize = 1000;

    async function _withMetrics<T>(operation: RedisOperation, fn: () => Promise<T>): Promise<T> {
        const start = Date.now();
        try {
            const result = await fn();
            redisOperationDuration.record(Date.now() - start, {operation, db, outcome: 'success'});
            return result;
        } catch (err) {
            redisOperationDuration.record(Date.now() - start, {operation, db, outcome: 'error'});
            redisErrorsCounter.add(1, {operation, db});
            throw err;
        }
    }

    cacheKeysCountGauge.addCallback(async result => {
        try {
            result.observe(Number(await redisClient.DBSIZE()), {db});
        } catch {
            redisErrorsCounter.add(1, {operation: 'dbsize', db});
        }
    });

    return {
        async storeData({key, data, expiresIn}: IStoreDataParams): Promise<void> {
            await _withMetrics('set', async () => {
                await redisClient.SET(key, data, {PX: expiresIn});
            });
        },
        async getData(keys: string[]): Promise<string[]> {
            return _withMetrics('get', () => redisClient.MGET(keys) as Promise<string[]>);
        },
        async deleteData(keys: string[]): Promise<void> {
            if (!keys?.length) {
                return;
            }

            await _withMetrics('del', async () => {
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
                                await redisClient.DEL(delKeys);
                            }
                        }),
                    );
                }
            });
        },
        async deleteAll(): Promise<void> {
            await _withMetrics('flush', () => redisClient.FLUSHDB());
        },
    };
}
