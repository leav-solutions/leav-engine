// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getConfig} from '../../config';
import i18nextInit from '../../i18nextInit';
import {initDI} from '../../depsManager';
import {initDb} from '../../infra/db/db';
import {type IDbUtils} from 'infra/db/dbUtils';
import {initRedis} from '../../infra/cache';

export async function setup() {
    try {
        const conf = await getConfig();
        const translator = await i18nextInit(conf);

        await initDb(conf);
        const redisClient = await initRedis({config: conf});

        const {coreContainer} = await initDI({
            translator,
            'core.infra.redis': redisClient
        });

        const dbUtils: IDbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.clearDatabase();
        await dbUtils.migrate(coreContainer);

        globalThis.coreContainer = coreContainer;
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
