module.exports = {
    server: {
        host: 'localhost',
        port: 4001
    },
    db: {
        url: process.env.ARANGO_URL,
        name: process.env.DB_NAME
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
        host: 'localhost',
        port: '5672',
        user: 'guest',
        password: 'guest',
        exchange: 'leav_core',
        type: 'direct'
    },
    filesManager: {
        queues: {
            filesEvents: 'files_events',
            previewRequest: 'files_preview_request',
            previewResponse: 'files_preview_response'
        },
        userId: '1',
        prefetch: 1
    },
    debug: false
};
