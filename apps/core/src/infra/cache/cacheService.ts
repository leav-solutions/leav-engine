// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IQueryInfos} from '_types/queryInfos';

export interface IMemoizeParams<T> {
    key: string;
    func: () => Promise<T>;
    storeNulls?: boolean;
    ctx: IQueryInfos;
}

export interface ICachesService {
    getCache?(type: ECacheType): ICacheService;
    memoize<T>(params: IMemoizeParams<T>): Promise<T>;
}

export interface ICacheService {
    storeData?(key: string, data: string, path?: string): Promise<void>;
    getData?(keys: string[], path?: string): Promise<string[]>;
    deleteData?(keys: string[], path?: string): Promise<void>;
    deleteAll?(path?: string): Promise<void>;
}

interface IDeps {
    'core.infra.cache.ramService'?: ICacheService;
    'core.infra.cache.diskService'?: ICacheService;
}

export enum ECacheType {
    DISK = 'DISK',
    RAM = 'RAM'
}

export default function ({
    'core.infra.cache.ramService': ramService = null,
    'core.infra.cache.diskService': diskService = null
}: IDeps): ICachesService {
    return {
        getCache(type: ECacheType): ICacheService {
            let cacheService: ICacheService;

            switch (type) {
                case ECacheType.DISK:
                    cacheService = diskService;
                    break;
                case ECacheType.RAM:
                    cacheService = ramService;
                    break;
            }

            return cacheService;
        },
        async memoize({key, func, storeNulls, ctx}) {
            const cacheService = this.getCache(ECacheType.RAM);
            const cacheValue = await cacheService.getData([key]);

            if (cacheValue[0]) {
                return JSON.parse(cacheValue[0]);
            }

            const result = await func();

            if (result !== null || storeNulls) {
                cacheService.storeData(key, JSON.stringify(result));
            }

            return result;
        }
    };
}
