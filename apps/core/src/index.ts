// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import fs from 'fs';
// import {IApplicationService} from 'infra/application/applicationService';
import {IConfig, CoreMode} from '_types/config';
import {IFilesManagerInterface} from 'interface/filesManager';
import {IIndexationManagerInterface} from 'interface/indexationManager';
import {IServer} from 'interface/server';
import {ITasksManagerInterface} from 'interface/tasksManager';
import {getConfig, validateConfig} from './config';
import {initDI} from './depsManager';
import i18nextInit from './i18nextInit';
import {initRedis} from './infra/cache';
import {initDb} from './infra/db/db';
import {initMailer} from './infra/mailer';
import {initPlugins} from './pluginsLoader';
import {initOIDCClient} from './infra/oidc';

(async function () {
    let conf: IConfig;

    try {
        conf = await getConfig();

        validateConfig(conf);
    } catch (e) {
        console.error('config error', e);
        process.exit(1);
    }

    // Init services
    const [translator, amqp, redisClient, mailer, oidcClient] = await Promise.all([
        i18nextInit(conf),
        amqpService({
            config: {
                ...conf.amqp,
                ...(conf.coreMode === CoreMode.TASKS_MANAGER_WORKER && {prefetch: conf.tasksManager.workerPrefetch})
            }
        }),
        initRedis({config: conf}),
        initMailer({config: conf}),
        conf.auth.oidc.enable ? initOIDCClient(conf) : undefined,
        initDb(conf)
    ]);

    const {coreContainer, pluginsContainer} = await initDI({
        translator,
        'core.infra.amqpService': amqp,
        'core.infra.redis': redisClient,
        'core.infra.mailer': mailer,
        'core.infra.oidcClient': oidcClient
    });

    const server: IServer = coreContainer.cradle['core.interface.server'];
    const filesManager: IFilesManagerInterface = coreContainer.cradle['core.interface.filesManager'];
    const indexationManager: IIndexationManagerInterface = coreContainer.cradle['core.interface.indexationManager'];
    const tasksManager: ITasksManagerInterface = coreContainer.cradle['core.interface.tasksManager'];
    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];
    const cli = coreContainer.cradle['core.interface.cli'];

    await initPlugins(coreContainer.cradle.pluginsFolder, pluginsContainer);

    const _createRequiredDirectories = async () => {
        if (!fs.existsSync('/files')) {
            await fs.promises.mkdir('/files');
        }
        if (!fs.existsSync(conf.preview.directory)) {
            await fs.promises.mkdir(conf.preview.directory);
        }
        if (!fs.existsSync(conf.export.directory)) {
            await fs.promises.mkdir(conf.export.directory);
        }
        if (!fs.existsSync(conf.import.directory)) {
            await fs.promises.mkdir(conf.import.directory);
        }
        if (!fs.existsSync(conf.diskCache.directory)) {
            await fs.promises.mkdir(conf.diskCache.directory);
        }
    };

    try {
        await _createRequiredDirectories();

        switch (conf.coreMode) {
            case CoreMode.SERVER:
                await server.init();
                await server.initConsumers();
                break;
            case CoreMode.MIGRATE:
                // Run db migrations
                await dbUtils.migrate(coreContainer);
                // Make sure we always exit process. Sometimes we don't and we're stuck here forever
                process.exit(0);
                break;
            case CoreMode.FILES_MANAGER:
                await filesManager.init();
                break;
            case CoreMode.INDEXATION_MANAGER:
                await indexationManager.init();
                break;
            case CoreMode.TASKS_MANAGER_MASTER:
                await tasksManager.initMaster();
                break;
            case CoreMode.TASKS_MANAGER_WORKER:
                await tasksManager.initWorker();
                break;
            default:
                await cli.run();
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(console.error);

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('exit', code => {
    console.info(`Exiting process ${process.pid} with code ${code}`);
});
