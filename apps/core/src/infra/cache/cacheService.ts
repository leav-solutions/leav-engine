// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import DataLoader from 'dataloader';
import {type IQueryInfos} from '_types/queryInfos';
import {getOrCreateDataLoaderInCtx} from '../../utils/dataloader';
import {nextTick} from 'process';
import ramService from './ramService';
import {type IRedis} from './redis';

export interface IMemoizeParams<T> {
    key: string;
    func: () => Promise<T>;
    storeNulls?: boolean;
    ctx: IQueryInfos;
}

export interface ICachesService {
    getCache(type: ECacheType): ICacheService;
    memoize<T>(params: IMemoizeParams<T>): Promise<T>;
}

export interface IStoreDataParams {
    key: string;
    data: string;
    path?: string;
    expiresIn?: number; // The specified expire time, in milliseconds
}

export interface ICacheService {
    storeData(params: IStoreDataParams): Promise<void>;
    getData(keys: string[], path?: string): Promise<string[]>;
    deleteData(keys: string[], path?: string): Promise<void>;
    deleteAll(path?: string): Promise<void>;
}

interface ICacheServiceDeps {
    'core.infra.redis': IRedis;
    'core.infra.cache.diskService': ICacheService;
}

export enum ECacheType {
    DISK = 'DISK',
    RAM = 'RAM',
}

type RamCacheDataLoader = DataLoader<string, unknown>;

export default function ({
    'core.infra.redis': redis,
    'core.infra.cache.diskService': diskService,
}: ICacheServiceDeps): ICachesService {
    const _ramService = ramService(redis.cache);

    /**
     * For the current request, keep in RAM the data loaded from redis.
     * This is useful to avoid multiple redis calls for the same key.
     * That happen often for getAttributeProperties for instance.
     *
     * Use dataloader instead on simple Map to synchronise async request for same key,
     * and sometimes mutualize redis mget.
     */
    function getRamCacheDataLoader(ctx: IQueryInfos): RamCacheDataLoader {
        return getOrCreateDataLoaderInCtx<RamCacheDataLoader>(
            ctx,
            'ramCache',
            () =>
                new DataLoader<string, unknown>(
                    async (keys: readonly string[]) =>
                        (await _ramService.getData([...keys])).map((data: string | null) =>
                            data !== null ? JSON.parse(data) : null,
                        ),
                    {
                        cache: true,
                    },
                ),
        );
    }

    /**
     * Ensure memoize compute function is not called multiple times concurrently for the same key.
     */
    const memoizePromiseMap = new Map<string, Promise<unknown>>();
    async function memoizeWithLock<T>(key: string, saveFunc: () => Promise<T>): Promise<T> {
        let savePromise = memoizePromiseMap.get(key);
        if (!savePromise) {
            // Start the computation and store the promise immediately to avoid race conditions
            savePromise = saveFunc();
            memoizePromiseMap.set(key, savePromise);
            savePromise.finally(() => {
                // Cleanup the promise from the map after it resolves
                // Use nextTick to ensure this runs after the current event loop tick
                nextTick(() => {
                    memoizePromiseMap.delete(key);
                });
            });
        }
        return savePromise as Promise<T>;
    }

    return {
        getCache(type: ECacheType): ICacheService {
            let cacheService: ICacheService;

            switch (type) {
                case ECacheType.DISK:
                    cacheService = diskService;
                    break;
                case ECacheType.RAM:
                    cacheService = _ramService;
                    break;
            }

            return cacheService;
        },
        async memoize<T>({key, func, storeNulls, ctx}: IMemoizeParams<T>): Promise<T> {
            const ramCacheDataLoader = getRamCacheDataLoader(ctx);
            const cacheValueFrom = await ramCacheDataLoader.load(key);
            if (cacheValueFrom != null) {
                return cacheValueFrom as T;
            }

            return memoizeWithLock<T>(key, async () => {
                const result = await func();

                if (result !== null || storeNulls) {
                    ramCacheDataLoader.prime(key, result);
                    // Do not wait for the storeData to finish, we can continue processing
                    _ramService.storeData({key, data: JSON.stringify(result)}).catch(() => undefined);
                }

                return result;
            });
        },
    };
}
