import {config} from './config';
import {init as initDI} from './depsManager';

(async function() {
    const container = await initDI();
    const server = container.cradle.server;
    const dbUtils = container.cradle.dbUtils;

    try {
        const opt = process.argv[2];
        if (typeof opt !== 'undefined' && opt.indexOf('migrate') !== -1) {
            // Run db migrations
            await dbUtils.migrate(container);
        } else {
            await server.init();
        }
    } catch (e) {
        console.log(e);
    }
})();
