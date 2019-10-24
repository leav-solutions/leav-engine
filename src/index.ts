import {createClient} from './redis/redis';
import * as fs from 'fs';
import * as Crypto from 'crypto';
import * as amqp from 'amqplib/callback_api';
import {Options, Connection, Channel} from 'amqplib';
import {start} from './watch/watch';
import {IConfig} from './types';

process.on('exit', code => {
    console.info('Process exit event with code:', code);
});

process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err);
    process.exit(1); // mandatory (as per the Node.js docs)
});

process.on('SIGINT', () => {
    console.info();
    console.info('User stop the app');
    process.exit(0);
});

const configPathArg = process.argv[2];
const configPath = configPathArg ? configPathArg : './config/config.json';

const rawConfig = fs.readFileSync(configPath);
const config: IConfig = JSON.parse(rawConfig.toString());

// Check if path exist
if (!fs.existsSync(config.rootPath)) {
    console.error('rootPath folder not found');
    process.exit(2);
}

// We take the rootKey from the config file or we create a hash of the rootPath if no rootKey
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
            console.error("Can't connect to rabbitMQ");
            process.exit(101);
        }

        const channel: Channel = await connection.createChannel();

        try {
            await channel.assertExchange(exchange, 'direct', {durable: true});
            await channel.assertQueue(queue, {durable: true});

            await channel.bindQueue(queue, exchange, routingKey);
        } catch (e) {
            console.error('Error when create exchange or channel', e.message);
            process.exit(102);
        }

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
