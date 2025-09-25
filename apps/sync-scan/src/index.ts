// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import automate, {extractChildrenDbElements} from './automate';
import {getConfig} from './config';
import * as scan from './scan';
import {type IConfig} from './_types/config';
import {logger} from '@leav/logger';

(async function () {
    try {
        const cfg: IConfig = await getConfig();
        logger.info('Scanning filesystem...');
        const fsScan = await scan.filesystem(cfg);

        logger.info('Scanning database...');
        const dbElements = await scan.database(cfg);

        const dbSettings = {
            filesLibraryId: dbElements.filesLibraryId,
            directoriesLibraryId: dbElements.directoriesLibraryId
        };
        const dbScan = extractChildrenDbElements(dbSettings, dbElements.treeContent);

        logger.info('RabbitMQ connection initialization...');
        const amqp = await amqpService({config: cfg.amqp});

        const begin = Date.now();
        logger.info('Synchronization...');
        await automate(fsScan, dbScan, dbSettings, amqp);

        logger.info('Closing RabbitMQ connection...');

        await amqp.close();
        logger.info(`Synchronization time ${Date.now() - begin} ms`);
    } catch (e) {
        logger.error(`Fatal error during init because ${e.stack || e}`);
        process.exit(1);
    }
})();

process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Unhandled Rejection at: ${reason.stack}`, {reason});
});
