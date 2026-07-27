import {createAmqpConnection, type IAmqpChannel} from '@leav/message-broker';
import {waitFor} from '@leav/utils';
import automate, {extractChildrenDbElements} from './automate';
import {getConfig} from './config';
import * as scan from './scan';
import {type IConfig} from './_types/config';
import {logger} from '@leav/logger';

const AMQP_CONNECT_TIMEOUT_MS = 30_000;

(async function () {
    const cfg: IConfig = await getConfig();
    logger.info('Scanning filesystem...');
    const fsScan = await scan.filesystem(cfg);

    logger.info('Scanning database...');
    const dbElements = await scan.database(cfg);

    const dbSettings = {
        filesLibraryId: dbElements.filesLibraryId,
        directoriesLibraryId: dbElements.directoriesLibraryId,
    };
    const dbScan = extractChildrenDbElements(dbSettings, dbElements.treeContent);

    logger.info('RabbitMQ connection initialization...');
    const connection = createAmqpConnection({
        connOpt: cfg.amqp.connOpt,
        heartbeatInSeconds: cfg.amqp.heartbeatInSeconds,
        connectionName: 'sync-scan',
    });

    const eventsChannel: IAmqpChannel = connection.createChannel({
        name: 'sync-scan:events',
        setup: async t => {
            await t.assertExchange(cfg.amqp.exchange, cfg.amqp.type, {durable: true});
        },
    });

    // One-shot job: fail fast rather than hang forever if the broker never comes up.
    await waitFor(() => connection.getConnectionState() === 'connected', {timeout: AMQP_CONNECT_TIMEOUT_MS});

    const begin = Date.now();
    logger.info('Synchronization...');
    await automate(fsScan, dbScan, dbSettings, eventsChannel);

    logger.info('Closing RabbitMQ connection...');

    await connection.close();
    logger.info(`Synchronization time ${Date.now() - begin} ms`);
})().catch(e => {
    logger.error(`Fatal error during init because ${e.stack || e}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled Rejection at: ${reason.stack}`, {reason});
});
