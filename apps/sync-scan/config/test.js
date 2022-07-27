// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const rootPath = require('app-root-path');

module.exports = {
    graphql: {
        uri: 'http://core.leav.localhost/graphql',
        token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwibG9naW4iOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NDUyNjc5MSwiZXhwIjo0NzA4NzI5MTkxfQ.RtTiK_mYUBKUenCKApHddfsrW-NgAsLGXWjwdDmLCMM'
    },
    filesystem: {
        absolutePath: rootPath.path + '/src/__tests__/_fixtures'
    },
    amqp: {
        exchange: 'leav_core_test_sync_scan',
        queue: 'files_events_test_sync_scan'
    }
};
