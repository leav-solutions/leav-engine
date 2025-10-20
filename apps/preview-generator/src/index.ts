// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {monitoringServer} from '@leav/monitoring-server';
import fs from 'fs';
import {startConsume} from './amqp/startConsume';
import {getConfig} from './getConfig/getConfig';
import {logger} from '@leav/logger';

(async function () {
    const config = await getConfig();
    const monitoringServerInstance = monitoringServer();

    // Ensure that the output directory exists
    if (!config.outputRootPath) {
        throw new Error('Output root path is not defined');
    }

    // Create the output directory if it doesn't exist
    try {
        await fs.promises.access(config.outputRootPath, fs.constants.F_OK);
    } catch (e) {
        await fs.promises.mkdir(config.outputRootPath);
    }

    await startConsume(config);
    await monitoringServerInstance.init();
})().catch(e => {
    logger.error(`2 - Fatal error during init because ${e.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled Rejection at: ${reason.stack}`, {reason});
});
