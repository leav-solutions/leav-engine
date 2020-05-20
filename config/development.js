module.exports = {
    rootPath: '/to_scan',
    rootKey: 'files1',
    redis: {
        host: 'redis',
        port: 6379
    },
    amqp: {
        protocol: 'amqp',
        hostname: 'message_broker',
        port: 15672,
        username: 'guest',
        password: 'guest',
        queue: 'files_events',
        exchange: 'leav_core',
        routingKey: 'files.event'
    },
    verbose: true
};
