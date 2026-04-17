// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {getConfig} from '../../config';
import i18nextInit from '../../i18nextInit';
import {initDI} from '../../depsManager';
import {initDb} from '../../infra/db/db';
import {type IDbUtils} from '../../infra/db/dbUtils';
import {initRedis} from '../../infra/cache';
import {type IDbService} from '../../infra/db/dbService';
import {type ITasksManagerInterface} from '../../interface/tasksManager';
import {type IRedis} from '../../infra/cache/redis';

let taskManagerMasterTimer: NodeJS.Timeout;

export async function setup() {
    try {
        const conf = await getConfig();
        const translator = await i18nextInit(conf);

        await initDb(conf);
        const redis = await initRedis({config: conf});
        const amqp = await amqpService({
            // limit prefetch to one for task cancel to avoid multiple tasks being started in parallel
            config: {...conf.amqp, prefetch: 1},
        });

        const {coreContainer} = await initDI({
            translator,
            'core.infra.redis': redis,
            'core.infra.amqpService': amqp,
        });

        const dbUtils: IDbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.clearDatabase();
        await dbUtils.migrate(coreContainer);

        // reset worker queue
        await amqp.consumer.channel.deleteQueue(conf.tasksManager.queues.execOrders);

        const tasksManager: ITasksManagerInterface = coreContainer.cradle['core.interface.tasksManager'];

        taskManagerMasterTimer = await tasksManager.initMaster();

        globalThis.coreContainer = coreContainer;
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}

export async function teardown() {
    try {
        // TODO improve master and worker stop, remove rabbitmq consumers ...
        clearInterval(taskManagerMasterTimer);

        const dbService: IDbService = globalThis.coreContainer?.cradle['core.infra.db.dbService'];
        if (dbService?.db) {
            dbService.db.close();
        }

        // Try to gracefully close Redis if we created it
        const redis = globalThis.coreContainer?.cradle['core.infra.redis'] as IRedis;

        // Try to gracefully close Redis if we created it
        if (redis?.cache && typeof redis.cache?.quit === 'function') {
            await redis.cache.quit();
        }

        if (redis?.session && typeof redis.session.quit === 'function') {
            await redis.session.quit();
        }
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
