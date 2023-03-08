// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {IFilesManagerInterface} from 'interface/filesManager';
import {IIndexationManagerInterface} from 'interface/indexationManager';
import {ITasksManagerInterface} from 'interface/tasksManager';
import * as Config from '_types/config';
import {getConfig, validateConfig} from './config';
import {initDI} from './depsManager';
import i18nextInit from './i18nextInit';
import {initRedis} from './infra/cache';
import {initDb} from './infra/db/db';
import {initPlugins} from './pluginsLoader';
import {amqpService} from '@leav/message-broker';
import {IApplicationService} from 'infra/application/applicationService';
import {initMailer} from './infra/mailer';

(async function () {
    let conf: Config.IConfig;

    try {
        conf = await getConfig();

        validateConfig(conf);
    } catch (e) {
        console.error('config error', e);
        process.exit(1);
    }

    await initDb(conf);

    // Init i18next
    const translator = await i18nextInit(conf);

    // Init AMQP
    const amqp = await amqpService({config: conf.amqp});
    const redisClient = await initRedis({config: conf});
    const mailer = await initMailer({config: conf});

    const {coreContainer, pluginsContainer} = await initDI({
        translator,
        'core.infra.amqpService': amqp,
        'core.infra.redis': redisClient,
        'core.infra.mailer': mailer
    });

    const server = coreContainer.cradle['core.interface.server'];
    const filesManager: IFilesManagerInterface = coreContainer.cradle['core.interface.filesManager'];
    const indexationManager: IIndexationManagerInterface = coreContainer.cradle['core.interface.indexationManager'];
    const tasksManager: ITasksManagerInterface = coreContainer.cradle['core.interface.tasksManager'];
    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];
    const cli = coreContainer.cradle['core.interface.cli'];
    const eventsManager = coreContainer.cradle['core.domain.eventsManager'];

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
        const opt = process.argv[2];

        await _createRequiredDirectories();

        if (typeof opt !== 'undefined' && opt.indexOf('server') !== -1) {
            await server.init();
            await eventsManager.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('migrate') !== -1) {
            // Run db migrations
            await dbUtils.migrate(coreContainer);
            // Make sure we always exit process. Sometimes we don't and we're stuck here forever
            process.exit(0);
        } else if (typeof opt !== 'undefined' && opt.indexOf('build-apps') !== -1) {
            // Run apps builds
            const applicationService: IApplicationService = coreContainer.cradle['core.infra.application.service'];
            await applicationService.runInstallAll();
            // Make sure we always exit process. Sometimes we don't and we're stuck here forever
            process.exit(0);
        } else if (typeof opt !== 'undefined' && opt.indexOf('filesManager') !== -1) {
            await filesManager.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('indexationManager') !== -1) {
            await indexationManager.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('tasksManager') !== -1) {
            await tasksManager.init();
        } else {
            await cli.run();
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(e => console.error(e));

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
