import {type IQueryInfos} from '../../_types/queryInfos';
import {type IConfig} from '../../_types/config';
import cacheServiceFactory, {type ICacheService, type ICachesService} from './cacheService';
import {type IRedis} from './redis';
import {type RedisClientType} from 'redis';
import {memoizeCounter, memoizeComputeDuration} from './_metrics';

vi.mock('./_metrics', () => ({
    memoizeCounter: {add: vi.fn()},
    memoizeComputeDuration: {record: vi.fn()},
    redisOperationDuration: {record: vi.fn()},
    redisErrorsCounter: {add: vi.fn()},
    cacheKeysCountGauge: {addCallback: vi.fn()},
}));

describe('cacheService', () => {
    const mockRedisCacheClient: Mockify<RedisClientType> = {
        SET: global.__mockPromise(),
        MGET: vi.fn(),
    };

    const mockRedis: IRedis = {
        cache: mockRedisCacheClient as unknown as RedisClientType,
        session: {} as RedisClientType,
    };

    const mockDiskService: Mockify<ICacheService> = {};

    const mockConfig = {
        dataLoaders: {
            cacheService: {
                ramCache: {maxBatchSize: 100},
            },
        },
    } as unknown as IConfig;

    let cachesService: ICachesService;

    beforeEach(() => {
        vi.clearAllMocks();
        cachesService = cacheServiceFactory({
            'core.infra.redis': mockRedis,
            'core.infra.cache.diskService': mockDiskService as ICacheService,
            config: mockConfig,
        });
    });

    const makeCtx = (): IQueryInfos => ({userId: '1', queryId: 'cacheServiceTest'});

    test('Counts a miss and records compute duration on success when the value is not yet in Redis', async () => {
        vi.mocked(mockRedisCacheClient.MGET).mockResolvedValueOnce([null]);
        const ctx = makeCtx();
        const func = vi.fn().mockResolvedValue('value');

        const result = await cachesService.memoize({key: 'myKey', func, ctx});

        expect(result).toBe('value');
        expect(func).toHaveBeenCalledTimes(1);
        expect(memoizeCounter.add).toHaveBeenCalledWith(1, {outcome: 'miss'});
        expect(memoizeComputeDuration.record).toHaveBeenCalledWith(expect.any(Number), {outcome: 'success'});
    });

    test('Counts a hit and skips the compute function when the value is already in Redis', async () => {
        vi.mocked(mockRedisCacheClient.MGET).mockResolvedValueOnce([JSON.stringify('cachedValue')]);
        const ctx = makeCtx();
        const func = vi.fn().mockResolvedValue('value');

        const result = await cachesService.memoize({key: 'myKey', func, ctx});

        expect(result).toBe('cachedValue');
        expect(func).not.toHaveBeenCalled();
        expect(memoizeCounter.add).toHaveBeenCalledWith(1, {outcome: 'hit'});
        expect(memoizeComputeDuration.record).not.toHaveBeenCalled();
    });

    test('Counts an error outcome and rethrows when the compute function fails', async () => {
        vi.mocked(mockRedisCacheClient.MGET).mockResolvedValueOnce([null]);
        const ctx = makeCtx();
        const error = new Error('compute failed');
        const func = vi.fn().mockRejectedValue(error);

        await expect(cachesService.memoize({key: 'errorKey', func, ctx})).rejects.toThrow(error);

        expect(memoizeCounter.add).toHaveBeenCalledWith(1, {outcome: 'miss'});
        expect(memoizeComputeDuration.record).toHaveBeenCalledWith(expect.any(Number), {outcome: 'error'});
    });
});
