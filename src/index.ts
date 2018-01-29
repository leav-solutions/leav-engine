import {config} from './config';
import {init as initDI} from './depsManager';

(async function() {
    const container = await initDI();
    const server = container.cradle.server;

    try {
        await server.init();
    } catch (e) {
        console.log(e);
    }
})();
