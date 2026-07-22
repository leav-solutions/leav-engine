import {createAmqpConnection} from '@leav/message-broker';
import {getConfig} from '../../config';
import i18nextInit from '../../i18nextInit';
import {initDI} from '../../depsManager';
import {initDb} from '../../infra/db/db';
import {initRedis} from '../../infra/cache';
import {type IGlobalThis} from './integrationTestUtils';
import {type IDbService} from '../../infra/db/dbService';
import {type IRedis} from '../../infra/cache/redis';
import {initMailer} from '../../infra/mailer';

declare const globalThis: IGlobalThis;

// Setup for each test suite to init awilix dependencies
beforeAll(async () => {
    try {
        const conf = await getConfig();
        const translator = await i18nextInit(conf);

        await initDb(conf);
        const redis = await initRedis({config: conf});
        const mailer = await initMailer({config: conf});
        const amqpConnection = createAmqpConnection({
            connOpt: conf.amqp.connOpt,
            heartbeatInSeconds: conf.amqp.heartbeatInSeconds,
            connectionName: conf.instanceId,
        });

        const {coreContainer} = await initDI({
            translator,
            'core.infra.redis': redis,
            'core.infra.amqp.connection': amqpConnection,
            'core.infra.mailer': mailer,
        });

        globalThis.coreContainer = coreContainer;
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
});

afterAll(async () => {
    const dbService: IDbService = globalThis.coreContainer?.cradle['core.infra.db.dbService'];
    if (dbService?.db) {
        dbService.db.close();
    }

    const redis = globalThis.coreContainer?.cradle['core.infra.redis'] as IRedis;

    // Try to gracefully close Redis if we created it
    if (redis?.cache && typeof redis.cache?.quit === 'function') {
        await redis.cache.quit();
    }

    if (redis?.session && typeof redis.session.quit === 'function') {
        await redis.session.quit();
    }
});
