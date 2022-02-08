// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cacache from 'cacache';
import {IConfig} from '_types/config';
import fs from 'fs';

export interface ICacheService {
    storeData?(type: string, key: string, data: string): Promise<void>;
    getData?(dataType: string, key: string): Promise<string>;
    deleteData?(dataType: string, key: string): Promise<void>;
    deleteAll?(dataType: string): Promise<void>;
}

interface IDeps {
    config?: IConfig;
}

export default function ({config = null}: IDeps): ICacheService {
    return {
        async storeData(dataType: string, key: string, data: string): Promise<void> {
            await cacache.put(`${config.diskCache.directory}/${dataType}`, key, data);
        },
        async getData(dataType: string, key: string): Promise<string> {
            const data = await cacache.get(`${config.diskCache.directory}/${dataType}`, key);
            return data.data.toString();
        },
        async deleteData(dataType: string, key: string): Promise<void> {
            await cacache.rm.entry(`${config.diskCache.directory}/${dataType}`, key);
        },
        async deleteAll(dataType: string): Promise<void> {
            return fs.promises.rmdir(`${config.diskCache.directory}/${dataType}`, {recursive: true});
        }
    };
}
