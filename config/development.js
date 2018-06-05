module.exports = {
    db: {
        url: 'http://root:@localhost:8529',
        name: 'leav_core'
    },
    logs: {
        level: 'silly',
        transport: ['console'] // Array containing one or more of : console, file
    },
    auth: {
        tokenExpiration: '99y'
    }
};
