// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {loadConfig} from '@leav/config-manager';
import {Channel, Connection, Options} from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import * as rootPath from 'app-root-path';
import * as Crypto from 'crypto';
import * as fs from 'fs';
import {env} from '../env';
import {createClient} from '../redis/redis';
import {IConfig} from '../types';
import {start} from '../watch/watch';

export const getConfig = async (): Promise<IConfig> =>
    loadConfig<IConfig>(rootPath.path + '/apps/automate-scan/config', env);

export const startWatch = async () => {
    const config = await getConfig();

    // Check if rootPath exist
    if (!fs.existsSync(config.rootPath)) {
        console.error('2 - rootPath folder not found', config.rootPath);
        process.exit(2);
    }

    // We take the rootKey from the config file
    // or we create a hash of the rootPath if no rootKey
    const rootKey = config.rootKey || Crypto.createHash('md5').update(config.rootPath).digest('hex');

    createClient(config.redis.host, config.redis.port);

    if (config.amqp) {
        const amqpConfig: Options.Connect = {
            protocol: config.amqp.protocol,
            hostname: config.amqp.hostname,
            username: config.amqp.username,
            password: config.amqp.password
        };

        const exchange = config.amqp.exchange;
        const queue = config.amqp.queue;
        const routingKey = config.amqp.routingKey;
        const type = config.amqp.type;

        const channel: Channel = await getChannel(amqpConfig, exchange, queue, routingKey, type);

        let watchParams = {};
        if (config.watcher && config.watcher.awaitWriteFinish) {
            watchParams = {...config.watcher, verbose: config.verbose};
        }

        const watcher = await start(config.rootPath, rootKey, watchParams, {
            channel,
            exchange,
            routingKey
        });

        return watcher;
    } else {
        const watchParams = {verbose: config.verbose};
        return start(config.rootPath, rootKey, watchParams);
    }
};

export const getChannel = async (
    amqpConfig: Options.Connect,
    exchange: string,
    queue: string,
    routingKey: string,
    type: string
) => {
    return new Promise<Channel>(resolve =>
        amqp.connect(amqpConfig, async (error0: any, connection: Connection | any) => {
            if (error0) {
                console.error("101 - Can't connect to rabbitMQ");
                process.exit(101);
            }

            const ch = await connection.createChannel();

            try {
                await ch.assertExchange(exchange, type, {durable: true});
            } catch (e) {
                console.error('102 - Error when assert exchange', e.message);
                process.exit(102);
            }

            try {
                await ch.assertQueue(queue, {durable: true});
            } catch (e) {
                console.error('103 - Error when assert queue', e.message);
                process.exit(103);
            }

            try {
                await ch.bindQueue(queue, exchange, routingKey);
            } catch (e) {
                console.error('104 - Error when bind queue', e.message);
                process.exit(104);
            }

            resolve(ch);
        })
    );
};
