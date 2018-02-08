module.exports = {
    db: {
        url: 'http://root:@localhost:8529',
        name: 'leav_core'
    },
    auth: {
        scheme: 'none',
        key: 'be24a1e8f48b39e13bb53b2f9f09db20',
        tokenExpiration: '1y'
    },
    logs: {
        level: 'silly',
        transport: ['console'] // Array containing one or more of : console, file
    }
};
