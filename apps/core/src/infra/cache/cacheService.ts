// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cacache from 'cacache';
import {IConfig} from '_types/config';
import fs from 'fs';
import {RedisClientType} from './redis';

export interface ICacheService {
    storeData?(cacheType: ECacheType, key: string, data: string, path?: string): Promise<void>;
    getData?(cacheType: ECacheType, keys: string[], path?: string): Promise<string[]>;
    deleteData?(cacheType: ECacheType, keys: string[], path?: string): Promise<void>;
    deleteAll?(cacheType: ECacheType, path?: string): Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.infra.redis'?: RedisClientType;
}

export enum ECacheType {
    DISK = 'DISK',
    RAM = 'RAM'
}

export default function ({config = null, 'core.infra.redis': redis = null}: IDeps): ICacheService {
    return {
        async storeData(cacheType: ECacheType, key: string, data: string, path?: string): Promise<void> {
            if (cacheType === ECacheType.DISK) {
                await cacache.put(`${config.diskCache.directory}/${path}`, key, data);
            } else if (cacheType === ECacheType.RAM) {
                await redis.SET(key, data);
            }
        },
        async getData(cacheType: ECacheType, keys: string[], path?: string): Promise<string[]> {
            if (cacheType === ECacheType.DISK) {
                const data = [];
                for (const k of keys) {
                    data.push((await cacache.get(`${config.diskCache.directory}/${path}`, k)).data.toString());
                }
                return data;
            } else if (cacheType === ECacheType.RAM) {
                return redis.MGET(keys);
            }
        },
        async deleteData(cacheType: ECacheType, keys: string[], path?: string): Promise<void> {
            if (cacheType === ECacheType.DISK) {
                for (const k of keys) {
                    await cacache.rm.entry(`${config.diskCache.directory}/${path}`, k);
                }
            } else if (cacheType === ECacheType.RAM) {
                await redis.DEL(keys);
            }
        },
        async deleteAll(cacheType: ECacheType, path?: string): Promise<void> {
            if (cacheType === ECacheType.DISK) {
                await fs.promises.rmdir(`${config.diskCache.directory}/${path}`, {recursive: true});
            } else if (cacheType === ECacheType.RAM) {
                await redis.FLUSHDB();
            }
        }
    };
}
