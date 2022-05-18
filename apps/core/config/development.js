// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    server: {
        publicUrl: process.env.SERVER_PUBLIC_URL || 'http://core.leav.localhost'
    },
    elasticsearch: {
        url: 'http://elasticsearch:9200'
    },
    logs: {
        level: 'silly',
        transport: 'console'
    },
    auth: {
        tokenExpiration: '99y'
    },
    debug: true
};
