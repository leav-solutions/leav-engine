module.exports = {
    rootPath: process.env.SCAN_ROOT_PATH,
    rootKey: process.env.SCAN_ROOT_KEY,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    amqp: {
        protocol: 'amqp',
        hostname: process.env.AMQP_HOST,
        port: process.env.AMQP_PORT,
        username: process.env.AMQP_USERNAME,
        password: process.env.AMQP_PWD,
        queue: process.env.AMQP_QUEUE,
        exchange: process.env.AMQP_EXCHANGE,
        routingKey: process.env.AMQP_ROUTING_KEY,
        type: 'direct'
    },
    watcher: {
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        },
        delay: 1100
    },
    verbose: false
};
