module.exports = {
    server: {
        host: 'localhost',
        port: 4001
    },
    db: {
        url: process.env.ARANGO_URL,
        name: process.env.DB_NAME
    },
    elasticsearch: {
        url: process.env.ELASTICSEARCH_URL
    },
    auth: {
        scheme: 'jwt',
        key: process.env.AUTH_KEY,
        algorithm: 'HS256',
        tokenExpiration: '7d'
    },
    lang: {
        available: ['fr', 'en'],
        default: 'fr'
    },
    logs: {
        level: 'info',
        transport: ['console', 'file'], // Array containing one or more of : console, file
        destinationFile: '/var/log/leav.log' // If logging in file
    },
    permissions: {default: true},
    amqp: {
        connOpt: {
            protocol: 'amqp',
            hostname: 'rabbitmq.leav.localhost',
            username: 'guest',
            password: 'guest',
            port: '5672'
        },
        exchange: 'leav_core',
        type: 'direct'
    },
    filesManager: {
        queues: {
            events: 'files_events',
            previewRequest: 'files_preview_request',
            previewResponse: 'files_preview_response'
        },
        routingKeys: {
            events: 'files.event',
            previewRequest: 'files.previewRequest',
            previewResponse: 'files.previewResponse'
        },
        rootKeys: {
            files1: 'files'
        },
        userId: '1',
        prefetch: 1
    },
    indexationManager: {
        queues: {
            events: 'indexation_events'
        },
        routingKeys: {
            events: 'indexation.event'
        },
        prefetch: 1
    },
    debug: false
};
