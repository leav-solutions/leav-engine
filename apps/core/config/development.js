// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const {envToBool} = require('@leav/config-manager');
const {release} = require('os');

module.exports = {
    server: {
        allowIntrospection: true
    },
    auth: {
        refreshTokenExpiration: '99y',
        cookie: {
            secure: false
        }
    },
    debug: true,
    dbProfiler: {
        enable: envToBool(process.env.DB_PROFILER_ENABLE, true)
    },
    bugsnag: {
        releaseStage: process.env.BUGSNAG_RELEASE_STAGE || 'development'
    },
    actions: {
        excel: {
            useNewHyperformula: true,
            debug: false
        }
    }
};
