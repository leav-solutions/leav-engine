// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService, IAmqpService} from '@leav/message-broker';
import automate, {_extractChildrenDbElements} from './automate';
import {getConfig} from './config';
import * as scan from './scan';
import {IConfig} from './_types/config';
import * as fs from 'fs';
import {_logMem} from './utils';

(async function () {
    try {
        const cfg: IConfig = await getConfig();
        console.info('Scanning filesystem...');
        const fsScan = await scan.filesystem(cfg);
        //const fsScan = JSON.parse(fs.readFileSync('./debug-fsScan.json', 'utf8'));

        console.info('Scanning database...');
        const dbElements = await scan.database(cfg);
        //const dbElements = JSON.parse(fs.readFileSync('./debug-dbScan.json', 'utf8'));

        const dbSettings = {
            filesLibraryId: dbElements.filesLibraryId,
            directoriesLibraryId: dbElements.directoriesLibraryId
        };
        const dbScan = _extractChildrenDbElements(dbSettings, dbElements.treeContent);

        console.info('RabbitMQ connection initialization...');
        const amqp = await amqpService({config: cfg.amqp});
        /*const amqp = {
            publisher: {connection: '' as any, channel: '' as any},
            consumer: {connection: '' as any, channel: '' as any},
            publish: (exchange: string, routingKey: string, msg: string): Promise<void> => Promise.resolve(),
            consume: (queue: string, routingKey: string, onMessage = () => Promise.resolve()): Promise<void> => Promise.resolve(),
            close: (): Promise<void> => Promise.resolve()
        } as IAmqpService;*/
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
