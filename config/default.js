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
    debug: false
};
