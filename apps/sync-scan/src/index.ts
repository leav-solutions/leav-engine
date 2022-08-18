// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import automate from './automate';
import {getConfig} from './config';
import * as scan from './scan';
import {IConfig} from './_types/config';

(async function () {
    try {
        const cfg: IConfig = await getConfig();

        console.info('Scanning filesystem...');
        const fsScan = await scan.filesystem(cfg);

        console.info('Scanning database...');
        const dbScan = await scan.database(cfg);

        console.info('RabbitMQ connection initialization...');
        const amqp = await amqpService({config: cfg.amqp});

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
