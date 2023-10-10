// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getConfig} from './config';
import {initConsumer} from './consumer';
import {initClient} from './elasticsearchService';

(async function () {
    try {
        const config = await getConfig();

        const esClient = await initClient(config);
        await initConsumer(config, esClient);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(e => console.error(e));

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
