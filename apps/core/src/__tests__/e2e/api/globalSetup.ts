// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {Database} from 'arangojs';
import fsremaned from 'fs';
import path from 'path';
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {ECacheType, ICachesService} from '../../../infra/cache/cacheService';
import {initRedis} from '../../../infra/cache/redis';
import {initMailer} from '../../../infra/mailer';
import {initPlugins} from '../../../pluginsLoader';
import {IConfig} from '../../../_types/config';
import {initOIDCClient} from '../../../infra/oidc';

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

export const init = async (conf: IConfig): Promise<any> => {
    // Init i18next
    const translator = await i18nextInit(conf);

    // Init AMQP
    const amqp = await amqpService({config: conf.amqp});
    const redisClient = await initRedis({config: conf});
    const mailer = await initMailer({config: conf});
    const oidcClient = conf.auth.oidc.enable ? await initOIDCClient(conf) : undefined;

    const {coreContainer, pluginsContainer} = await initDI({
        translator,
        'core.infra.amqpService': amqp,
        'core.infra.redis': redisClient,
        'core.infra.mailer': mailer,
        'core.infra.oidcClient': oidcClient
    });

    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

    // Clear all caches (redis cache for example might persist between runs)
    const cacheService: ICachesService = coreContainer.cradle['core.infra.cache.cacheService'];
    await cacheService.getCache(ECacheType.DISK).deleteAll();
    await cacheService.getCache(ECacheType.RAM).deleteAll();

    await initPlugins(coreContainer.cradle.pluginsFolder, pluginsContainer);

    return {coreContainer, dbUtils};
};

const _createRequiredDirectories = async conf => {
    if (!fsremaned.existsSync(conf.import.directory)) {
        await fsremaned.promises.mkdir(conf.import.directory);
    }

    if (!fsremaned.existsSync(conf.diskCache.directory)) {
        await fsremaned.promises.mkdir(conf.diskCache.directory);
    }

    const filesDir = conf.files.rootPaths.trim().split(':')[1];

    if (!fsremaned.existsSync(filesDir)) {
        await fsremaned.promises.mkdir(filesDir);
    }
};

export async function setup() {
    try {
        await _setupFakePlugin();

        const conf = await getConfig();

        await _createRequiredDirectories(conf);

        // Init DB
        const db = new Database({
            url: conf.db.url
        });

        const databases = await db.listDatabases();
        const dbExists = databases.reduce((exists, d) => exists || d === conf.db.name, false);

        if (dbExists) {
            await db.dropDatabase(conf.db.name);
        }

        await db.createDatabase(conf.db.name);

        const {coreContainer, dbUtils} = await init(conf);

        await dbUtils.migrate(coreContainer);

        const server = coreContainer.cradle['core.interface.server'];

        await server.init();
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
