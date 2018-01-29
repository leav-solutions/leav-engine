module.exports = {
    server: {
        host: 'localhost',
        port: 3001
    },
    db: {
        url: process.env.ARANGO_URL,
        name: process.env.DB_NAME
    },
    auth: {
        scheme: 'jwt',
        key: process.env.AUTH_KEY,
        tokenExpiration: '7d',
        passwordRegex: /^.{6,20}$/
    },
    lang: {
        available: ['fr', 'en'],
        default: 'fr'
    }
};
