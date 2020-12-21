module.exports = {
    server: {
        host: process.env.SERVER_HOST || 'localhost',
        port: process.env.SERVER_PORT || 4001
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
        tokenExpiration: process.env.TOKEN_TTL || '7d'
    },
    lang: {
        available: process.env.LANG_AVAILABLE || ['fr', 'en'],
        default: process.env.LANG_DEFAULT || 'fr'
    },
    logs: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.LOG_TRANSPORT || ['console', 'file'], // Array containing one or more of : console, file
        destinationFile: process.env.LOG_FILE // If logging in file
    },
    permissions: {default: true},
    amqp: {
        connOpt: {
            protocol: 'amqp',
            hostname: process.env.AMQP_HOST,
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PASSWORD,
            port: process.env.AMQP_PORT || '5672',
        },
        exchange: process.env.AMQP_EXCHANGE || 'leav_core',
        type: process.env.AMQP_TYPE || 'direct'
    },
    filesManager: {
        queues: {
            events: process.env.FM_EVENTS_QUEUE || 'files_events',
            previewRequest: process.env.FM_PREVIEW_REQUEST_QUEUE || 'files_preview_request',
            previewResponse: process.env.FM_PREVIEW_RESPONSE_QUEUE ||'files_preview_response'
        },
        routingKeys: {
            events: 'files.event',
            previewRequest: 'files.previewRequest',
            previewResponse: 'files.previewResponse'
        },
        rootKeys: {
            files1: 'files'
        },
        userId: process.env.FM_USER_ID || '1',
        prefetch: 1
    },
    eventsManager: {
        routingKeys: {
            events: 'database.event'
        }
    },
    indexationManager: {
        queues: {
            events: 'indexation_events'
        },
        prefetch: 1
    },
    debug: process.env.DEBUG || false
};
