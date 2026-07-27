const {envToNumber} = require('@leav/config-manager');

module.exports = {
    allowFilesList: process.env.ALLOW_FILES_LIST || '',
    ignoreFilesList: process.env.IGNORE_FILES_LIST || '',
    graphql: {
        uri: process.env.GRAPHQL_URI,
        apiKey: process.env.GRAPHQL_API_KEY,
        treeId: process.env.GRAPHQL_TREE_ID || 'files_tree',
    },
    filesystem: {
        absolutePath: process.env.FILESYSTEM_ABSOLUTE_PATH,
    },
    amqp: {
        connOpt: {
            protocol: process.env.AMQP_PROTOCOL || 'amqp',
            hostname: process.env.AMQP_HOST,
            port: envToNumber(process.env.AMQP_PORT, 5672),
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PWD,
        },
        heartbeatInSeconds: envToNumber(process.env.AMQP_HEARTBEAT, 30),
        exchange: process.env.AMQP_EXCHANGE || 'leav_core',
        type: process.env.AMQP_TYPE || 'direct',
        routingKey: process.env.AMQP_ROUTING_KEY || 'files.event',
        rootKey: process.env.AMQP_ROOT_KEY || 'files1',
    },
};
