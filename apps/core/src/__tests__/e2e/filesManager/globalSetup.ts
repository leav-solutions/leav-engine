// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {ECacheType, type ICachesService} from '../../../infra/cache/cacheService';
import {initDb} from '../../../infra/db/db';
import {initRedis} from '../../../infra/cache';
import {initMailer} from '../../../infra/mailer';
import {type ISessionRepo} from '../../../infra/session/sessionRepo';
import {type IE2EUserParams} from '../api/e2eUtils';
import {type TestProject} from 'vitest/node';

declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface ProvidedContext {
        guestUser: IE2EUserParams;
        nonAdminUser: IE2EUserParams;
        nonAdminGroupId: string;
        graphqlUrl: string;
    }
}

export async function setup(project: TestProject) {
    try {
        const conf = await getConfig();
        // Export it here to avoid await in e2eUtils before creating the graphql client
        project.provide('graphqlUrl', `http://${conf.server.host}:${conf.server.port}/graphql`);

        // Fake user to avoid e2eUtils loading error
        // Not used in filesManager e2e tests, but required for global setup to work
        // May be merge those tests in api tests
        // But those ones are not working for now
        project.provide('guestUser', {
            userId: '',
            groupsId: [],
        });
        project.provide('nonAdminUser', {
            userId: '',
            groupsId: [],
        });
        project.provide('nonAdminGroupId', '');

        await initDb(conf);

        // Init i18next
        const translator = await i18nextInit(conf);

        // Init AMQP
        const amqp = await amqpService({config: conf.amqp});
        const redis = await initRedis({config: conf});
        const mailer = await initMailer({config: conf});

        const {coreContainer} = await initDI({
            translator,
            'core.infra.amqpService': amqp,
            'core.infra.redis': redis,
            'core.infra.mailer': mailer,
        });

        // Clear all caches (redis cache for example might persist between runs)
        const cacheService: ICachesService = coreContainer.cradle['core.infra.cache.cacheService'];
        await cacheService.getCache(ECacheType.DISK).deleteAll();
        await cacheService.getCache(ECacheType.RAM).deleteAll();

        // Clear sessions
        const sessionRepo: ISessionRepo = coreContainer.cradle['core.infra.session'];
        await sessionRepo.deleteAll();

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
