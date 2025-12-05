// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Channel, type Connection, type Options} from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import * as Crypto from 'crypto';
import * as fs from 'fs';
import {getConfig} from '../config';
import {createClient} from '../redis/redis';
import {start} from '../watch/watch';
import {logger} from '@leav/logger';

export const startWatch = async () => {
    const config = await getConfig();

    // Check if rootPath exist
    if (!fs.existsSync(config.rootPath)) {
        logger.error(`2 - rootPath folder not found ${config.rootPath}`);
        process.exit(2);
    }

    // We take the rootKey from the config file
    // or we create a hash of the rootPath if no rootKey
    const rootKey = config.rootKey || Crypto.createHash('md5').update(config.rootPath).digest('hex');

    await createClient(config.redis.host, config.redis.port);

    if (config.amqp) {
        const amqpConfig: Options.Connect = {
            protocol: config.amqp.protocol,
            hostname: config.amqp.hostname,
            username: config.amqp.username,
            password: config.amqp.password,
        };

        const exchange = config.amqp.exchange;
        const queue = config.amqp.queue;
        const routingKey = config.amqp.routingKey;
        const type = config.amqp.type;

        const channel: Channel = await getChannel(amqpConfig, exchange, queue, routingKey, type);

        let watchParams = {};
        if (config.watcher && config.watcher.awaitWriteFinish) {
            watchParams = config.watcher;
        }

        const watcher = await start(config.rootPath, rootKey, watchParams, {
            channel,
            exchange,
            routingKey,
        });

        return watcher;
    } else {
        return start(config.rootPath, rootKey);
    }
};

export const getChannel = async (
    amqpConfig: Options.Connect,
    exchange: string,
    queue: string,
    routingKey: string,
    type: string,
) =>
    new Promise<Channel>(resolve =>
        amqp.connect(amqpConfig, async (error0: any, connection: Connection | any) => {
            if (error0) {
                logger.error("101 - Can't connect to rabbitMQ");
                process.exit(101);
            }

            const ch = await connection.createChannel();

            try {
                await ch.assertExchange(exchange, type, {durable: true});
            } catch (e) {
                logger.error(`102 - Error when assert exchange ${(e as Error).message}`);
                process.exit(102);
            }

            try {
                await ch.assertQueue(queue, {durable: true});
            } catch (e) {
                logger.error(`103 - Error when assert queue ${(e as Error).message}`);
                process.exit(103);
            }

            try {
                await ch.bindQueue(queue, exchange, routingKey);
            } catch (e) {
                logger.error(`104 - Error when bind queue ${(e as Error).message}`);
                process.exit(104);
            }

            resolve(ch);
        }),
    );
