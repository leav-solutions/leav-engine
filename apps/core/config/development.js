// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
};
