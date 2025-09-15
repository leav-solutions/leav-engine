// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {monitoringServer} from '@leav/monitoring-server';
import {getConfig} from './config';
import {initConsumer} from './consumer';
import {elasticsearchService} from './elasticsearchService';
import {logger} from '@leav/logger';

(async function () {
    try {
        const config = await getConfig();

        const monitoringServerInstance = monitoringServer();

        const esService = await elasticsearchService(config);
        await initConsumer(config, esService);
        await monitoringServerInstance.init();
    } catch (e) {
        logger.error('Fatal error during startup ' + e.stack);
        process.exit(1);
    }
})().catch(e => logger.error('Fatal error during initialization ' + e.stack));

process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled Rejection at: ${reason.stack}`);
});

process.on('exit', code => {
    logger.info(`Exiting process ${process.pid} with code ${code}`);
});
