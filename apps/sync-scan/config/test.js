// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const rootPath = require('app-root-path');

module.exports = {
    graphql: {
        uri: 'http://core.leav.localhost/graphql',
        apiKey: 'my_api_key'
    },
    filesystem: {
        absolutePath: rootPath.path + '/src/__tests__/_fixtures'
    },
    amqp: {
        exchange: 'leav_core_test_sync_scan',
        queue: 'files_events_test_sync_scan'
    }
};
