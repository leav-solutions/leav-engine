module.exports = {
    db: {
        url: 'http://arango.leav.localhost',
        name: 'leav_core'
    },
    elasticsearch: {
        url: 'http://elasticsearch:9200'
    },
    amqp: {
        connOpt: {
            hostname: 'rabbitmq.leav.localhost',
            username: 'guest',
            password: 'guest',
        },
    },
    logs: {
        level: 'silly',
        transport: ['console'] // Array containing one or more of : console, file
    },
    auth: {
        tokenExpiration: '99y'
    },
    debug: true
};
