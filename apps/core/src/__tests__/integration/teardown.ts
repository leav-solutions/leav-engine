// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDbService} from 'infra/db/dbService';
import {type IRedis} from '../../infra/cache/redis';

export default async function () {
    try {
        const dbService: IDbService = globalThis.coreContainer?.cradle['core.infra.db.dbService'];
        if (dbService?.db) {
            dbService.db.close();
        }

        // Try to gracefully close Redis if we created it
        const redis = globalThis.coreContainer?.cradle['core.infra.redis'] as IRedis;

        if (redis?.cache && typeof redis.cache?.quit === 'function') {
            await redis.cache.quit();
        }

        if (redis?.session && typeof redis.session.quit === 'function') {
            await redis.session.quit();
        }
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
