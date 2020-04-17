import {FullTreeContent} from './_types/queries';
import {FilesystemContent} from './_types/filesystem';
import {RMQConn} from './_types/rmq';
import * as scan from './scan';
import automate from './automate';
import * as rmq from './rmq';
import config from './config';
import {Config} from './_types/config';

(async function() {
    try {
        const cfg: Config = await config;

        const rmqConn: RMQConn = await rmq.init(cfg.rmq);

        const fsScan: FilesystemContent = await scan.filesystem(cfg.filesystem);
        const dbScan: FullTreeContent = await scan.database(cfg.graphql);

        await automate(fsScan, dbScan, rmqConn.channel);

        await rmqConn.connection.close();
    } catch (e) {
        console.error(e);
    }
})();

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
