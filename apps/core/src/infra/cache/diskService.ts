// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cacache from 'cacache';
import {IConfig} from '_types/config';
import fs from 'fs';
import {ICacheService} from './cacheService';

interface IDeps {
    config?: IConfig;
}

export default function ({config = null}: IDeps): ICacheService {
    return {
        async storeData(key: string, data: string, path?: string): Promise<void> {
            await cacache.put(`${config.diskCache.directory}/${path}`, key, data);
        },
        async getData(keys: string[], path?: string): Promise<string[]> {
            const data = [];

            for (const k of keys) {
                const value = await cacache.get(`${config.diskCache.directory}/${path}`, k);
                data.push(value.data.toString());
            }

            return data;
        },
        async deleteData(keys: string[], path?: string): Promise<void> {
            for (const k of keys) {
                await cacache.rm.entry(`${config.diskCache.directory}/${path}`, k);
            }
        },
        async deleteAll(path?: string): Promise<void> {
            await fs.promises.rmdir(`${config.diskCache.directory}/${path}`, {recursive: true});
        }
    };
}
