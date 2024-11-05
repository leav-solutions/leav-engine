// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    server: {
        publicUrl: process.env.SERVER_PUBLIC_URL || 'http://core.leav.localhost'
    },
    logs: {
        level: 'silly',
        transport: 'console'
    },
    auth: {
        refreshTokenExpiration: '99y'
    },
    debug: true,
    dbProfiler: {
        enable: typeof process.env.DB_PROFILER_ENABLE !== 'undefined' ? !!Number(process.env.DB_PROFILER_ENABLE) : true
    }
};
