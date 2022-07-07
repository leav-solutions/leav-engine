// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import automate from './automate';
import {getConfig} from './config';
import * as scan from './scan';
import {IConfig} from './_types/config';
import {FilesystemContent} from './_types/filesystem';
import {FullTreeContent} from './_types/queries';
import {amqpService, IAmqpService} from '@leav/message-broker';

(async function () {
    try {
        const cfg: IConfig = await getConfig();

        console.info('Scanning filesystem...');
        const fsScan: FilesystemContent = await scan.filesystem(cfg);

        console.info('Scanning database...');
        const dbScan: FullTreeContent = await scan.database(cfg);

        console.info('RabbitMQ connection initialization...');
        const amqp: IAmqpService = await amqpService({config: cfg.amqp});

        console.info('Synchronization...');
        await automate(fsScan, dbScan, amqp);

        console.info('Closing RabbitMQ connection...');
        await amqp.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
