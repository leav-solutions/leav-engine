const path = require('path');

module.exports = {
    graphql: {
        uri: 'http://core.leav.localhost/graphql',
        apiKey: 'my_api_key',
    },
    filesystem: {
        absolutePath: path.join(__dirname, '../src/__tests__/_fixtures'),
    },
    amqp: {
        exchange: 'leav_core_test_sync_scan',
        queue: 'files_events_test_sync_scan',
    },
};
