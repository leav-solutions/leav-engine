module.exports = {
    graphql: {
        uri: process.env.GRAPHQL_URI,
        token: process.env.GRAPHQL_TOKEN,
        treeId: process.env.GRAPHQL_TREE_ID
    },
    filesystem: {
        absolutePath: process.env.FILESYSTEM_ABSOLUTE_PATH
    },
    rmq: {
        connOpt: {
            protocol: process.env.RMQ_CONN_PROTOCOL,
            hostname: process.env.RMQ_CONN_HOSTNAME,
            username: process.env.RMQ_CONN_USERNAME,
            password: process.env.RMQ_CONN_PASSWORD
        },
        queue: process.env.RMQ_QUEUE,
        exchange: process.env.RMQ_EXCHANGE,
        routingKey: process.env.RMQ_ROUTING_KEY,
        rootKey: process.env.RMQ_ROOT_KEY,
        type: process.env.RMQ_TYPE
    }
};
