import {logger} from '@leav/logger';
import {startWatch} from './setupWatcher/setupWatcher';
import {monitoringServer} from '@leav/monitoring-server';

process.on('uncaughtException', err => {
    logger.error(`1 - There was an uncaught error ${err.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled Rejection at: ${reason.stack}`, {reason});
    process.exit(1);
});

// handle CTRL + C
process.on('SIGINT', () => {
    logger.info('0 - User stopped the app');
    process.exit(0);
});

(async () => {
    const monitoringServerInstance = monitoringServer();

    await startWatch();

    await monitoringServerInstance.init();
})().catch(e => {
    logger.error(`2 - Fatal error during init because ${e.stack}`);
    process.exit(1);
});
