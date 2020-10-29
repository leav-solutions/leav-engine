module.exports = {
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
    debug: true
};
