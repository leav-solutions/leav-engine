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
    } catch {
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
