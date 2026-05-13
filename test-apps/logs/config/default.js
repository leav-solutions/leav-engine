module.exports = {
    coreUrl: process.env.CORE_URL || 'http://core.leav.localhost',
    auth: {
        login: process.env.AUTH_login || 'admin',
        password: process.env.AUTH_PASSWORD || 'admin',
    },
};
