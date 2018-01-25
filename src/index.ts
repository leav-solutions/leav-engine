import {config} from './config';
import {init as initDI} from './depsManager';

(async function() {
    await initDI();
})();
