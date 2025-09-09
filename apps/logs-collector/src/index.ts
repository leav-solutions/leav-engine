// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getConfig} from './config';
import {initConsumer} from './consumer';
import {ElasticsearchService} from './elasticsearchService';

(async function () {
    try {
        const config = await getConfig();

        const esService = await ElasticsearchService(config);
        await initConsumer(config, esService);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(e => console.error(e));

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
