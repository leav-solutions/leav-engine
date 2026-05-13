const {envToBool} = require('@leav/config-manager');

module.exports = {
    server: {
        allowIntrospection: envToBool(process.env.SERVER_ALLOW_INTROSPECTION, true),
    },
    auth: {
        // avoid login frequently in development
        refreshTokenExpiration: process.env.REFRESH_TOKEN_TTL || '2d',
        cookie: {
            // in development, allow non secure cookies for http
            secure: envToBool(process.env.AUTH_COOKIE_SECURE, false),
        },
    },
    debug: envToBool(process.env.DEBUG, true),
    dbProfiler: {
        enable: envToBool(process.env.DB_PROFILER_ENABLE, true),
    },
    bugsnag: {
        releaseStage: process.env.BUGSNAG_RELEASE_STAGE || 'development',
    },
    automation: {
        enable: envToBool(process.env.AUTOMATION_ENABLE, true),
    },
};
