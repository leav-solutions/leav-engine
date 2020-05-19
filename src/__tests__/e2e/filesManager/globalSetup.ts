import {connect, Options} from 'amqplib';
import {Database} from 'arangojs';
import {getConfig} from '../../../config';
import {init as initDI} from '../../../depsManager';
import * as Config from '../../../_types/config';

export async function setup() {
    try {
        const conf = await getConfig();

        await _resetAmqpQueues(conf);
        await _initDB(conf);
    } catch (e) {
        console.error(e);
    }
}

const _resetAmqpQueues = async (conf: Config.IConfig) => {
    // reset amqp queue
    const amqpConfig: Options.Connect = {
        hostname: conf.amqp.host,
        username: conf.amqp.user,
        password: conf.amqp.password
    };
    const connection = await connect(amqpConfig);
    const channel = await connection.createChannel();

    // delete exchange to avoid error with type
    await channel.deleteExchange(conf.amqp.exchange);
    await channel.assertExchange(conf.amqp.exchange, conf.amqp.type);

    // create queue to avoid error if not exist
    await channel.assertQueue(conf.filesManager.queues.filesEvents, {durable: true});
    await channel.assertQueue(conf.filesManager.queues.previewRequest, {durable: true});
    await channel.assertQueue(conf.filesManager.queues.previewResponse, {durable: true});

    await channel.purgeQueue(conf.filesManager.queues.filesEvents);
    await channel.purgeQueue(conf.filesManager.queues.previewRequest);
    await channel.purgeQueue(conf.filesManager.queues.previewResponse);
};

const _initDB = async (conf: Config.IConfig) => {
    // Init DB
    const db = new Database({
        url: conf.db.url
    });

    const databases = await db.listDatabases();
    const dbExists = databases.reduce((exists, d) => exists || d === conf.db.name, false);

    if (dbExists) {
        await db.dropDatabase(conf.db.name);
    }

    await db.createDatabase(conf.db.name);

    const {coreContainer} = await initDI();

    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

    await dbUtils.migrate(coreContainer);

    const filesManager = coreContainer.cradle['core.interface.filesManager'];
    await filesManager.init();
};

export const getCoreContainer = async () => {
    const {coreContainer} = await initDI();
    return coreContainer;
};

export const getAmqpChannel = async () => {
    const conf = await getConfig();

    // reset amqp queue
    const amqpConfig: Options.Connect = {
        hostname: conf.amqp.host,
        username: conf.amqp.user,
        password: conf.amqp.password
    };
    const connection = await connect(amqpConfig);

    const channel = await connection.createChannel();

    return {connection, channel};
};
