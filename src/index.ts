import {config} from './config';
import {init as initDI} from './depsManager';
import i18nextInit from './i18nextInit';
import {initDb} from './infra/db/db';
import {initPlugins} from './pluginsLoader';

(async function() {
    const conf: any = await config;

    await initDb(conf);

    // Init i18next
    const translator = await i18nextInit(conf);

    const {coreContainer, pluginsContainer} = await initDI({translator});

    const server = coreContainer.cradle['core.interface.server'];
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
        } else {
            await cli.run();
        }
    } catch (e) {
        console.error(e);
    }
})().catch(e => console.error(e));
