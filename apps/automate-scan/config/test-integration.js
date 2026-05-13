const rootPath = require('app-root-path');

module.exports = {
    rootPath: rootPath.path + '/src/__tests__/integration/_fixtures',
    amqp: {
        protocol: 'amqp',
        hostname: process.env.AMQP_HOST,
        port: process.env.AMQP_PORT || '5672',
        username: process.env.AMQP_USERNAME,
        password: process.env.AMQP_PWD,
        queue: 'test_files_events',
        exchange: 'test_leav_core',
        routingKey: 'files.event',
        type: process.env.AMQP_TYPE || 'direct',
    },
};
