// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {monitoringServer} from '@leav/monitoring-server';
import fs from 'fs';
import {type IConfig, CoreMode} from './_types/config';
import {type IFilesManagerInterface} from 'interface/filesManager';
import {type IIndexationManagerInterface} from 'interface/indexationManager';
import {type IServer} from 'interface/server';
import {type ITasksManagerInterface} from 'interface/tasksManager';
import {getConfig, validateConfig} from './config';
import {initDI} from './depsManager';
import i18nextInit from './i18nextInit';
import {initRedis} from './infra/cache';
import {initDb} from './infra/db/db';
import {initMailer} from './infra/mailer';
import {initPlugins} from './pluginsLoader';
import {initOIDCClient} from './infra/oidc';
import Bugsnag from '@bugsnag/js';
import {type IUtils} from './utils/utils';
import {logger} from '@leav/logger';
import {setupLogger} from './utils/logger/logger';
import {type ILogsCollectorInterface} from './interface/logsCollector';
import {type ICorePluginsApp} from 'app/core/pluginsApp';

(async function () {
    let conf: IConfig;

    try {
        conf = await getConfig();
        validateConfig(conf);
    } catch (e) {
        logger.error(`Config error because ${e.stack}`);
        process.exit(1);
    }

    setupLogger(conf);

    if (conf.bugsnag.enable) {
        logger.info(
            `Starting Bugsnag monitoring appVersion=${conf.bugsnag.appVersion} releaseStage=${conf.bugsnag.releaseStage}`,
        );
        Bugsnag.start({
            apiKey: conf.bugsnag.apiKey,
            appVersion: conf.bugsnag.appVersion,
            appType: conf.bugsnag.appType,
            releaseStage: conf.bugsnag.releaseStage,
            logger,
            metadata: {
                instance: {
                    id: conf.instanceId,
                    url: conf.server.publicUrl,
                },
            },
        });
    }

    // Init services
    const [translator, amqp, redis, mailer, oidcClient] = await Promise.all([
        i18nextInit(conf),
        amqpService({
            config: {
                ...conf.amqp,
                ...(conf.coreMode === CoreMode.TASKS_MANAGER_WORKER && {prefetch: conf.tasksManager.workerPrefetch}),
            },
        }),
        initRedis({config: conf}),
        initMailer({config: conf}),
        conf.auth.oidc.enable ? initOIDCClient(conf) : undefined,
        initDb(conf),
    ]);

    const {coreContainer, pluginsContainer} = await initDI({
        translator,
        'core.infra.amqpService': amqp,
        'core.infra.redis': redis,
        'core.infra.mailer': mailer,
        'core.infra.oidcClient': oidcClient,
    });

    const monitoringServerInstance = monitoringServer();

    const server: IServer = coreContainer.cradle['core.interface.server'];
    const filesManager: IFilesManagerInterface = coreContainer.cradle['core.interface.filesManager'];
    const indexationManager: IIndexationManagerInterface = coreContainer.cradle['core.interface.indexationManager'];
    const logsCollector: ILogsCollectorInterface = coreContainer.cradle['core.interface.logsCollector'];
    const tasksManager: ITasksManagerInterface = coreContainer.cradle['core.interface.tasksManager'];
    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];
    const cli = coreContainer.cradle['core.interface.cli'];
    const utils: IUtils = coreContainer.cradle['core.utils'];
    const pluginsApp: ICorePluginsApp = coreContainer.cradle['core.app.core.plugins'];

    const _createRequiredDirectories = async () => {
        if (!(await utils.fileExists('/files'))) {
            await fs.promises.mkdir('/files');
        }
        if (!(await utils.fileExists(conf.preview.directory))) {
            await fs.promises.mkdir(conf.preview.directory);
        }
        if (!(await utils.fileExists(conf.export.directory))) {
            await fs.promises.mkdir(conf.export.directory);
        }
        if (!(await utils.fileExists(conf.import.directory))) {
            await fs.promises.mkdir(conf.import.directory);
        }
        if (!(await utils.fileExists(conf.diskCache.directory))) {
            await fs.promises.mkdir(conf.diskCache.directory);
        }
    };

    await _createRequiredDirectories();

    logger.info(`Starting core in mode ${conf.coreMode}`);

    await initPlugins(conf.pluginsPath, pluginsContainer);

    switch (conf.coreMode) {
        case CoreMode.SERVER:
            await pluginsApp.startPlugins();
            await server.init();
            await server.initConsumers();
            await monitoringServerInstance.init();
            break;
        case CoreMode.MIGRATE:
            // Run db migrations
            await dbUtils.migrate(coreContainer);
            // Make sure we always exit process. Sometimes we don't and we're stuck here forever
            process.exit(0);
        case CoreMode.FILES_MANAGER:
            await filesManager.init();
            await monitoringServerInstance.init();
            break;
        case CoreMode.INDEXATION_MANAGER:
            await indexationManager.init();
            await monitoringServerInstance.init();
            break;
        case CoreMode.TASKS_MANAGER_MASTER:
            await tasksManager.initMaster();
            await monitoringServerInstance.init();
            break;
        case CoreMode.TASKS_MANAGER_WORKER:
            await tasksManager.initWorker();
            await monitoringServerInstance.init();
            break;
        case CoreMode.LOGS_COLLECTOR:
            await logsCollector.init();
            await monitoringServerInstance.init();
            break;
        case CoreMode.E2E_PLAYWRIGHT:
            await pluginsApp.startPlugins();
            await server.init();
            await server.initConsumers();
            await indexationManager.init();
            await tasksManager.initMaster();
            await tasksManager.initWorker();
            // no logsCollector.init() yet because not needed in e2e tests, need elasticsearch
            // no filesManager.init(); yet because not needed in e2e tests
            await monitoringServerInstance.init();
            break;
        case CoreMode.CLI:
        default:
            await cli.run();
    }
})().catch(e => {
    logger.error(`Fatal error during initialization ${e.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled Rejection at: ${reason.stack}`);
});

process.on('exit', code => {
    logger.info(`Exiting process ${process.pid} with code ${code}`);
});
