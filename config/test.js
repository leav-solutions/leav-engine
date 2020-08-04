module.exports = {
    server: {
        host: '0.0.0.0',
        port: 7357
    },
    db: {
        url: 'http://root:@arangodb:8529',
        name: 'leav_test'
    },
    elasticsearch: {
        url: 'http://elasticsearch:9200'
    },
    amqp: {
        host: 'message_broker',
        type: 'direct',
        exchange: 'test_leav_core'
    },
    filesManager: {
        queues: {
            filesEvents: 'test_files_events',
            previewRequest: 'test_files_preview_request',
            previewResponse: 'test_files_preview_response'
        }
    },
    debug: true
};
