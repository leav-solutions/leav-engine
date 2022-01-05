// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import automate from './automate';
import {getConfig} from './config';
import * as amqp from './amqp';
import * as scan from './scan';
import {IConfig} from './_types/config';
import {FilesystemContent} from './_types/filesystem';
import {FullTreeContent} from './_types/queries';
import {IAmqpConn} from './_types/amqp';

(async function () {
    try {
        const cfg: IConfig = await getConfig();

        const amqpConn: IAmqpConn = await amqp.init(cfg.amqp);

        const fsScan: FilesystemContent = await scan.filesystem(cfg);
        const dbScan: FullTreeContent = await scan.database(cfg);

        await automate(fsScan, dbScan, amqpConn.channel);

        await amqpConn.connection.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
