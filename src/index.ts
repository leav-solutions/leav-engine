import * as amqp from 'amqplib';
import {FullTreeContent} from './_types/queries';
import {FilesystemContent} from './_types/filesystem';
import {RMQConn} from './_types/rmq';
import * as scan from './scan';
import automate from './automate';
import * as rmq from './rmq';
import {Config} from './_types/config';
import config from './config';

const WAIT_BEFORE_CLOSING_CONN = 30000; // ms

(async function() {
    try {
        const conf: Config = await config;

        // RabbitMQ initialization
        const connOpt: amqp.Options.Connect = conf.rmq.connOpt;
        const {exchange, queue, routingKey, type} = conf.rmq;
        const rmqConn: RMQConn = await rmq.init(connOpt, exchange, queue, routingKey, type);

        const fsScan: FilesystemContent = await scan.filesystem();
        const dbScan: FullTreeContent = await scan.database();

        await automate(fsScan, dbScan, rmqConn.channel);

        // Wait 30s for the queue to be consumed before closing connection
        setTimeout(() => rmqConn.connection.close(), WAIT_BEFORE_CLOSING_CONN);
    } catch (e) {
        console.error(e);
    }
})();

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
