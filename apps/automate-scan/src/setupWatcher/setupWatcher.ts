import {createAmqpConnection, type IAmqpChannel} from '@leav/message-broker';
import * as Crypto from 'crypto';
import * as fs from 'fs';
import {getConfig} from '../config';
import {createClient} from '../redis/redis';
import {start} from '../watch/watch';
import {logger} from '@leav/logger';
import {type IConfig} from '../types';

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
        const {exchange, routingKey} = config.amqp;
        const channel = getChannel(config.amqp, rootKey);

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

export const getChannel = (amqpConfig: NonNullable<IConfig['amqp']>, rootKey: string): IAmqpChannel => {
    const connection = createAmqpConnection({
        connOpt: amqpConfig.connOpt,
        heartbeatInSeconds: amqpConfig.heartbeatInSeconds,
        connectionName: `automate-scan-${rootKey}`,
    });

    return connection.createChannel({
        name: 'automate-scan:files-events',
        setup: async t => {
            await t.assertExchange(amqpConfig.exchange, amqpConfig.type, {durable: true});
            await t.assertQueue(amqpConfig.queue, {durable: true});
            await t.bindQueue(amqpConfig.queue, amqpConfig.exchange, amqpConfig.routingKey);
        },
    });
};
