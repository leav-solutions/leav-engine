module.exports = {
    graphql: {
        uri: 'http://core.leav.localhost/graphql',
        token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwibG9naW4iOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NDUyNjc5MSwiZXhwIjo0NzA4NzI5MTkxfQ.RtTiK_mYUBKUenCKApHddfsrW-NgAsLGXWjwdDmLCMM',
        treeId: 'files_tree'
    },
    filesystem: {
        absolutePath: '/home/jrmy/dev/docker-compose/files'
    },
    rmq: {
        connOpt: {
            protocol: 'amqp',
            hostname: 'rabbitmq.leav.localhost',
            username: 'guest',
            password: 'guest'
        },
        queue: 'files_events',
        exchange: 'leav_core',
        routingKey: 'files.event',
        rootKey: 'files1',
        type: 'direct'
    }
};
