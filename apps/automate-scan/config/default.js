const {envToBool, envToNumber} = require('@leav/config-manager');

module.exports = {
    allowFilesList: process.env.ALLOW_FILES_LIST || '',
    ignoreFilesList: process.env.IGNORE_FILES_LIST || '',
    rootPath: process.env.ROOT_PATH,
    rootKey: process.env.ROOT_KEY,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
    amqp: {
        connOpt: {
            protocol: process.env.AMQP_PROTOCOL || 'amqp',
            hostname: process.env.AMQP_HOST,
            port: process.env.AMQP_PORT || '5672',
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PWD,
        },
        heartbeatInSeconds: envToNumber(process.env.AMQP_HEARTBEAT, 30),
        queue: process.env.AMQP_QUEUE || 'files_events',
        exchange: process.env.AMQP_EXCHANGE || 'leav_core',
        routingKey: process.env.AMQP_ROUTING_KEY || 'files.event',
        type: process.env.AMQP_TYPE || 'direct',
    },
    watcher: {
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100,
        },
        delay: 1100,
        usePolling: envToBool(process.env.WATCHER_USE_POLLING, false),
        pollingInterval: envToNumber(process.env.WATCHER_POLLING_INTERVAL, 100),
    },
};
