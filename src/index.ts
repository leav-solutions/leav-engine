import {createClient} from './redis/redis';
import * as fs from 'fs';
import * as Crypto from 'crypto';
import * as amqp from 'amqplib/callback_api';
import {Options, Connection, Channel} from 'amqplib';
import {start} from './watch/watch';
import {IConfig} from './types';

const configPathArg = process.argv[2];
const configPath = configPathArg ? configPathArg : './config/config.json';

const rawConfig = fs.readFileSync(configPath);
const config: IConfig = JSON.parse(rawConfig.toString());

const rootKey =
    config.rootKey ||
    Crypto.createHash('md5')
        .update(config.rootPath)
        .digest('hex');

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

    amqp.connect(amqpConfig, async (error0: any, connection: Connection | any) => {
        if (error0) {
            throw error0;
        }

        const channel: Channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'direct', {durable: true});
        await channel.assertQueue(queue, {durable: true});

        await channel.bindQueue(queue, exchange, routingKey);

        let watchParams = {};
        if (config.watcher && config.watcher.awaitWriteFinish) {
            watchParams = {
                ...config.watcher.awaitWriteFinish,
                verbose: config.verbose
            };
        }

        start(config.rootPath, rootKey, watchParams, {
            channel,
            exchange,
            routingKey
        });
    });
} else {
    const watchParams = {verbose: config.verbose};
    start(config.rootPath, rootKey, watchParams);
}
