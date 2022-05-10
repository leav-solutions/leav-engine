// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {initAmqp} from '../../../infra/amqp';
import {initRedis} from '../../../infra/cache/redis';
import {initDb} from '../../../infra/db/db';

export async function setup() {
    try {
        const conf = await getConfig();

        await initDb(conf);

        // Init i18next
        const translator = await i18nextInit(conf);

        // Init AMQP
        const amqpConn = await initAmqp({config: conf});
        const redisClient = await initRedis({config: conf});

        const {coreContainer} = await initDI({
            translator,
            'core.infra.amqp': amqpConn,
            'core.infra.redis': redisClient
        });
        const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.clearDatabase();

        await dbUtils.migrate(coreContainer);

        const elasticsearch = coreContainer.cradle['core.infra.elasticsearch.elasticsearchService'];

        if (await elasticsearch.indiceExists('indexation_library_test')) {
            await elasticsearch.indiceDelete('indexation_library_test');
        }

        const server = coreContainer.cradle['core.interface.server'];
        const indexationManager = coreContainer.cradle['core.interface.indexationManager'];

        await server.init();
        await indexationManager.init();
    } catch (e) {
        console.error(e);
    }
}
