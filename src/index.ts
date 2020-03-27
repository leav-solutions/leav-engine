import {Channel, Options} from 'amqplib';
import {FullTreeContent} from './_types/queries';
import {FilesystemContent} from './_types/filesystem';
import {RMQConn} from './_types/rmq';
import * as scan from './scan';
import automate from './automate';
import * as rmq from './rmq';
import {Config} from './_types/config';
import config from './config';

(async function() {
    try {
        const conf: Config = await config;

        const fsScan: FilesystemContent = await scan.filesystem();
        const dbScan: FullTreeContent = await scan.database();

        const amqpConfig: Options.Connect = conf.rmq.amqpConfig;
        const {exchange, queue, routingKey, type} = conf.rmq;
        const rmqConn: RMQConn = await rmq.init(amqpConfig, exchange, queue, routingKey, type);

        await automate(fsScan, dbScan, rmqConn.channel);

        await rmqConn.channel.close();
        await rmqConn.connection.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(e => console.error(e));

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
