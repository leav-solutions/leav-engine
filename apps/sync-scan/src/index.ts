// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import automate, {extractChildrenDbElements} from './automate';
import {getConfig} from './config';
import * as scan from './scan';
import {IConfig} from './_types/config';
import {_logMem} from './utils';

(async function () {
    try {
        const cfg: IConfig = await getConfig();
        console.info('Scanning filesystem...');
        const fsScan = await scan.filesystem(cfg);

        console.info('Scanning database...');
        const dbElements = await scan.database(cfg);

        const dbSettings = {
            filesLibraryId: dbElements.filesLibraryId,
            directoriesLibraryId: dbElements.directoriesLibraryId
        };
        const dbScan = extractChildrenDbElements(dbSettings, dbElements.treeContent);

        console.info('RabbitMQ connection initialization...');
        const amqp = await amqpService({config: cfg.amqp});

        console.time('Synchronization time');
        console.info('Synchronization...');
        await automate(fsScan, dbScan, dbSettings, amqp);

        console.info('Closing RabbitMQ connection...');

        await amqp.close();
        console.timeEnd('Synchronization time');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
