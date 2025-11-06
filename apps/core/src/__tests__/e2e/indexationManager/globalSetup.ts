// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {ECacheType, type ICachesService} from '../../../infra/cache/cacheService';
import {initRedis} from '../../../infra/cache';
import {initDb} from '../../../infra/db/db';
import {initMailer} from '../../../infra/mailer';
import {initOIDCClient} from '../../../infra/oidc';
import {type IDbUtils} from 'infra/db/dbUtils';
import {type IServer} from 'interface/server';
import {type ITasksManagerInterface} from 'interface/tasksManager';
import {type IIndexationManagerInterface} from 'interface/indexationManager';
import {type ISessionRepo} from '../../../infra/session/sessionRepo';

export async function setup() {
    try {
        const conf = await getConfig();

        await initDb(conf);

        // Init i18next
        const translator = await i18nextInit(conf);

        // Init AMQP
        const amqp = await amqpService({config: conf.amqp});
        const redis = await initRedis({config: conf});
        const mailer = await initMailer({config: conf});
        const oidcClient = conf.auth.oidc.enable ? await initOIDCClient(conf) : undefined;

        const {coreContainer} = await initDI({
            translator,
            'core.infra.amqpService': amqp,
            'core.infra.redis': redis,
            'core.infra.mailer': mailer,
            'core.infra.oidcClient': oidcClient,
        });

        // Clear all caches (redis cache for example might persist between runs)
        const cacheService: ICachesService = coreContainer.cradle['core.infra.cache.cacheService'];
        await cacheService.getCache(ECacheType.DISK).deleteAll();
        await cacheService.getCache(ECacheType.RAM).deleteAll();

        // Clear sessions
        const sessionRepo: ISessionRepo = coreContainer.cradle['core.infra.session'];
        await sessionRepo.deleteAll();

        const dbUtils: IDbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.clearDatabase();

        await dbUtils.migrate(coreContainer);

        const server: IServer = coreContainer.cradle['core.interface.server'];
        const indexationManager: IIndexationManagerInterface = coreContainer.cradle['core.interface.indexationManager'];
        const tasksManager: ITasksManagerInterface = coreContainer.cradle['core.interface.tasksManager'];

        await server.init();
        await indexationManager.init();
        await tasksManager.initMaster();
        await tasksManager.initWorker();
    } catch (e) {
        console.error(e);
    }
}
