// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    graphql: {
        uri: process.env.GRAPHQL_URI,
        token: process.env.GRAPHQL_TOKEN,
        treeId: process.env.GRAPHQL_TREE_ID || 'files_tree'
    },
    filesystem: {
        absolutePath: process.env.FILESYSTEM_ABSOLUTE_PATH
    },
    rmq: {
        connOpt: {
            protocol: process.env.AMQP_PROTOCOL || 'amqp',
            hostname: process.env.AMQP_HOST,
            port: process.env.AMQP_PORT || 5672,
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PWD
        },
        queue: process.env.AMQP_QUEUE || 'files_events',
        exchange: process.env.AMQP_EXCHANGE || 'leav_core',
        routingKey: process.env.AMQP_ROUTING_KEY || 'files.event',
        rootKey: process.env.AMQP_ROOT_KEY || 'files1',
        type: 'direct'
    }
};
