module.exports = {
    server: {
        host: '0.0.0.0',
        port: 4001
    },
    elasticsearch: {
        url: 'http://elasticsearch:9200'
    },
    logs: {
        level: 'silly',
        transport: ['console'] // Array containing one or more of : console, file
    },
    auth: {
        tokenExpiration: '99y'
    },
    debug: true,
};
