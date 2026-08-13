import * as redis from 'redis';
import {type IConfig} from '../../_types/config';
import {logger} from '@leav/logger';
import {type RedisClientType} from 'redis';

interface IDeps {
    config?: IConfig;
}

export interface IRedis {
    cache: RedisClientType;
    session: RedisClientType;
}

export async function initRedis({config}: IDeps): Promise<IRedis> {
    const _newClient = async (database: number): Promise<RedisClientType> => {
        const client = redis.createClient({
            socket: {
                host: config.redis.host,
                port: config.redis.port,
            },
            database,
        });

        client.on('error', err => {
            logger.warn(
                `Redis connection to ${config.redis.host}:${config.redis.port}/${database} error: ${err.message}`,
            );
        });

        client.on('ready', () => {
            logger.silly(`Redis connection to ${config.redis.host}:${config.redis.port}/${database} ready`);
        });

        await client.connect();

        return client;
    };

    return {
        cache: await _newClient(config.redis.cacheDatabase),
        session: await _newClient(config.redis.sessionDatabase),
    };
}
