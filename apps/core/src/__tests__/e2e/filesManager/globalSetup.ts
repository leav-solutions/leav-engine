// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {ECacheType, ICachesService} from '../../../infra/cache/cacheService';
import {initDb} from '../../../infra/db/db';
import {initRedis} from '../../../infra/cache/redis';
import {initMailer} from '../../../infra/mailer';

export async function setup() {
    try {
        const conf = await getConfig();

        await initDb(conf);

        // Init i18next
        const translator = await i18nextInit(conf);

        // Init AMQP
        const amqp = await amqpService({config: conf.amqp});
        const redisClient = await initRedis({config: conf});
        const mailer = await initMailer({config: conf});

        const {coreContainer} = await initDI({
            translator,
            'core.infra.amqpService': amqp,
            'core.infra.redis': redisClient,
            'core.infra.mailer': mailer
        });

        // Clear all caches (redis cache for example might persist between runs)
        const cacheService: ICachesService = coreContainer.cradle['core.infra.cache.cacheService'];
        await cacheService.getCache(ECacheType.DISK).deleteAll();
        await cacheService.getCache(ECacheType.RAM).deleteAll();

        const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.clearDatabase();
        await dbUtils.migrate(coreContainer);

        const server = coreContainer.cradle['core.interface.server'];
        const filesManager = coreContainer.cradle['core.interface.filesManager'];

        await server.init();
        await filesManager.init();
    } catch (e) {
        console.error(e);
    }
}
