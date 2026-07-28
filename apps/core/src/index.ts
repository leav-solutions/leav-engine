import {createAmqpConnection} from '@leav/message-broker';
import {monitoringServer} from '@leav/monitoring-server';
import fs from 'fs';
import {type IConfig, CORE_MODES_E2E_PLAYWRIGHT, CoreMode} from './_types/config';
import {type IAutomationInterface} from './interface/automation';
import {type IFilesManagerInterface} from './interface/filesManager';
import {type IIndexationManagerInterface} from './interface/indexationManager';
import {type IServer} from './interface/server';
import {type ITasksManagerInterface} from './interface/tasksManager';
import {type ICliInterface} from './interface/cli';
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
import {type ISDOInterface} from './interface/sdo';
import {type ICorePluginsApp} from './app/core/pluginsApp';

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
    const [translator, redis, mailer, oidcClient] = await Promise.all([
        i18nextInit(conf),
        initRedis({config: conf}),
        initMailer({config: conf}),
        conf.auth.oidc.enable ? initOIDCClient(conf) : undefined,
        initDb(conf),
    ]);

    const amqpConnection = createAmqpConnection({
        connOpt: conf.amqp.connOpt,
        heartbeatInSeconds: conf.amqp.heartbeatInSeconds,
        connectionName: conf.instanceId,
    });

    const {coreContainer, pluginsContainer} = await initDI({
        translator,
        'core.infra.amqp.connection': amqpConnection,
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
    const automation: IAutomationInterface = coreContainer.cradle['core.interface.automation'];
    const sdo: ISDOInterface = coreContainer.cradle['core.interface.sdo'];
    const cli: ICliInterface = coreContainer.cradle['core.interface.cli'];
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

    logger.info(`Starting core in mode ${conf.coreModes.length > 0 ? conf.coreModes.join(', ') : 'cli'}`);

    await initPlugins(conf.pluginsPath, pluginsContainer);

    const isCli = conf.coreModes.includes(CoreMode.CLI);
    if (isCli) {
        // Run CLI
        await cli.run();
        // Make sure we always exit process.
        process.exit(0);
    }

    const isE2ePlaywright = conf.coreModes.includes(CoreMode.E2E_PLAYWRIGHT);
    const modesToStart = isE2ePlaywright ? CORE_MODES_E2E_PLAYWRIGHT : conf.coreModes;

    for (const mode of modesToStart) {
        switch (mode) {
            case CoreMode.SERVER:
                await pluginsApp.startPlugins();
                await server.init();
                await server.initConsumers();
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
            case CoreMode.LOGS_COLLECTOR:
                await logsCollector.init();
                break;
            case CoreMode.AUTOMATION:
                await automation.init();
                break;
            case CoreMode.SDO:
                await sdo.init();
                break;
        }
    }
    await monitoringServerInstance.init();
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
