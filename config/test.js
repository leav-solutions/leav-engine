module.exports = {
    server: {
        host: '0.0.0.0',
        port: 7357
    },
    db: {
        url: process.env.ARANGO_URL || 'http://root:@arangodb:8529',
        name: 'leav_test'
    },
    amqp: {
        exchange: 'test_leav_core'
    },
    filesManager: {
        queues: {
            filesEvents: 'test_files_events',
            previewRequest: 'test_files_preview_request',
            previewResponse: 'test_files_preview_response'
        }
    },
    logs: {
        transport: ['console']
    },
    debug: true
};
