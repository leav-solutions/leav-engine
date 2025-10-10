// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDbService} from 'infra/db/dbService';

export default async function () {
    try {
        const dbService: IDbService = globalThis.coreContainer?.cradle['core.infra.db.dbService'];
        if (dbService?.db) {
            dbService.db.close();
        }

        // Try to gracefully close Redis if we created it
        const redis: any = globalThis.coreContainer?.cradle['core.infra.redis'];
        if (redis && typeof redis.__client?.quit === 'function') {
            await redis.__client.quit();
        }
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
