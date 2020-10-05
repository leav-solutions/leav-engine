import {IDbUtils} from 'infra/db/dbUtils';
import {IFilesManagerInterface} from 'interface/filesManager';
import {IIndexationManagerInterface} from 'interface/indexationManager';
import * as Config from '_types/config';
import {getConfig, validateConfig} from './config';
import {init as initDI} from './depsManager';
import i18nextInit from './i18nextInit';
import {initDb} from './infra/db/db';
import {initPlugins} from './pluginsLoader';
import {initAmqp} from './infra/amqp';

(async function() {
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
    const amqpConn = await initAmqp({config: conf});

    const {coreContainer, pluginsContainer} = await initDI({translator, 'core.infra.amqp': amqpConn});

    const server = coreContainer.cradle['core.interface.server'];
    const filesManager: IFilesManagerInterface = coreContainer.cradle['core.interface.filesManager'];
    const indexationManager: IIndexationManagerInterface = coreContainer.cradle['core.interface.indexationManager'];
    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];
    const cli = coreContainer.cradle['core.interface.cli'];

    await initPlugins(coreContainer.cradle.pluginsFolder, pluginsContainer);

    try {
        const opt = process.argv[2];

        if (typeof opt !== 'undefined' && opt.indexOf('server') !== -1) {
            await server.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('migrate') !== -1) {
            // Run db migrations
            await dbUtils.migrate(coreContainer);

            // Make sure we always exit process. Sometimes we don't and we're stuck here forever
            process.exit(0);
        } else if (typeof opt !== 'undefined' && opt.indexOf('filesManager') !== -1) {
            // Init files management
            await filesManager.init();
        } else if (typeof opt !== 'undefined' && opt.indexOf('indexationManager') !== -1) {
            await indexationManager.init();
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
