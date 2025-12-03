// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {logger} from '@leav/logger';
import fsremaned from 'fs';
import path from 'path';
import {type AwilixContainer} from 'awilix';
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {ECacheType, type ICachesService} from '../../../infra/cache/cacheService';
import {initRedis} from '../../../infra/cache';
import {initMailer} from '../../../infra/mailer';
import {initPlugins} from '../../../pluginsLoader';
import {type IConfig} from '../../../_types/config';
import {initOIDCClient} from '../../../infra/oidc';
import {initDb} from '../../../infra/db/db';
import {type IDbUtils} from 'infra/db/dbUtils';
import {type IServer} from 'interface/server';
import {type ISessionRepo} from '../../../infra/session/sessionRepo';
import {type ITasksManagerInterface} from 'interface/tasksManager';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {USERS_GROUPS_LIBRARY, USERS_LIBRARY} from '../../../_types/library';
import {type GetSystemQueryContext} from 'utils/helpers/getSystemQueryContext';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import {type IGlobalThis} from './e2eUtils';
import {GUEST_USER_EMAIL, NON_ADMIN_USER_EMAIL} from './constants';

declare const globalThis: IGlobalThis;

const _setupFakePlugin = async () => {
    // Copy fake plugin to appropriate folder
    const pluginsFolder = path.resolve('./src/plugins/');
    const fakePluginSrc = `${__dirname}/_fixtures/fakeplugin`;
    const fakePluginDest = `${pluginsFolder}/fakeplugin`;
    const relativePath = path.relative(pluginsFolder, fakePluginSrc);

    try {
        await fsremaned.promises.symlink(relativePath, fakePluginDest);
    } catch (e) {
        // It's ok, already exists
        if (e.code === 'EEXIST') {
            return;
        }

        console.error(e);
    }
};

export const init = async (conf: IConfig): Promise<{coreContainer: AwilixContainer; dbUtils: IDbUtils}> => {
    // Init i18next
    const translator = await i18nextInit(conf);

    // Init AMQP
    const amqp = await amqpService({config: conf.amqp});
    const redis = await initRedis({config: conf});
    const mailer = await initMailer({config: conf});
    const oidcClient = conf.auth.oidc.enable ? await initOIDCClient(conf) : undefined;

    const {coreContainer, pluginsContainer} = await initDI({
        translator,
        'core.infra.amqpService': amqp,
        'core.infra.redis': redis,
        'core.infra.mailer': mailer,
        'core.infra.oidcClient': oidcClient,
    });

    const dbUtils: IDbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

    // Clear all caches (redis cache for example might persist between runs)
    const cacheService: ICachesService = coreContainer.cradle['core.infra.cache.cacheService'];
    await cacheService.getCache(ECacheType.DISK).deleteAll();
    await cacheService.getCache(ECacheType.RAM).deleteAll();

    // Clear sessions
    const sessionRepo: ISessionRepo = coreContainer.cradle['core.infra.session'];
    await sessionRepo.deleteAll();

    // reset worker queue
    await amqp.consumer.channel.deleteQueue(conf.tasksManager.queues.execOrders);

    await initPlugins(conf.pluginsPath, pluginsContainer);

    return {coreContainer, dbUtils};
};

const _createRequiredDirectories = async conf => {
    if (!fsremaned.existsSync(conf.import.directory)) {
        await fsremaned.promises.mkdir(conf.import.directory);
    }
    if (!fsremaned.existsSync(conf.export.directory)) {
        await fsremaned.promises.mkdir(conf.export.directory);
    }
    if (!fsremaned.existsSync(conf.diskCache.directory)) {
        await fsremaned.promises.mkdir(conf.diskCache.directory);
    }

    const filesDir = conf.files.rootPaths.trim().split(':')[1];

    if (!fsremaned.existsSync(filesDir)) {
        await fsremaned.promises.mkdir(filesDir);
    }
};

const _createUsersAndGroups = async (coreContainer: AwilixContainer) => {
    const recordDomain: IRecordDomain = coreContainer.cradle['core.domain.record'];
    const treeDomain: ITreeDomain = coreContainer.cradle['core.domain.tree'];
    const getSystemQueryContext: GetSystemQueryContext = coreContainer.cradle['core.utils.getSystemQueryContext'];
    const systemCtx = getSystemQueryContext();

    logger.verbose('Creating guest and non-admin users...');
    const guestUserRecord = await recordDomain.createRecord({
        library: USERS_LIBRARY,
        ctx: systemCtx,
        values: [
            {
                attribute: 'email',
                payload: GUEST_USER_EMAIL,
            },
        ],
    });

    globalThis.guestUser = {
        userId: guestUserRecord.record.id,
        groupsId: [],
    };

    const nonAdminGroupRecord = await recordDomain.createRecord({
        library: USERS_GROUPS_LIBRARY,
        ctx: systemCtx,
        values: [
            {
                attribute: 'label',
                payload: 'non-admin',
            },
        ],
    });

    const nonAdminGroupNode = await treeDomain.addElement({
        treeId: 'users_groups',
        element: {
            id: nonAdminGroupRecord.record.id,
            library: USERS_GROUPS_LIBRARY,
        },
        parent: null,
        ctx: systemCtx,
    });

    globalThis.nonAdminGroupId = nonAdminGroupNode.id;

    const nonAdminUserRecord = await recordDomain.createRecord({
        library: USERS_LIBRARY,
        ctx: systemCtx,
        values: [
            {
                attribute: 'email',
                payload: NON_ADMIN_USER_EMAIL,
            },
            {
                attribute: 'user_groups',
                payload: nonAdminGroupNode.id,
            },
        ],
    });

    globalThis.nonAdminUser = {
        userId: nonAdminUserRecord.record.id,
        groupsId: [nonAdminGroupNode.id],
    };
};

export async function setup() {
    try {
        await _setupFakePlugin();

        const conf = await getConfig();

        await _createRequiredDirectories(conf);
        await initDb(conf);

        const {coreContainer, dbUtils} = await init(conf);

        await dbUtils.clearDatabase();
        await dbUtils.migrate(coreContainer);

        const server: IServer = coreContainer.cradle['core.interface.server'];
        const tasksManager: ITasksManagerInterface = coreContainer.cradle['core.interface.tasksManager'];

        await server.init();
        await server.initConsumers();
        await tasksManager.initMaster();
        await tasksManager.initWorker();

        await _createUsersAndGroups(coreContainer);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
