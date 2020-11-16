module.exports = {
    server: {
        host: '0.0.0.0',
        port: 7357
    },
    db: {
        name: 'leav_test'
    },
    elasticsearch: {
        url: 'http://elasticsearch:9200'
    },
    amqp: {
        exchange: 'test_leav_core'
    },
    filesManager: {
        queues: {
            events: 'test_files_events',
            previewRequest: 'test_files_preview_request',
            previewResponse: 'test_files_preview_response'
        }
    },
    eventsManager: {
        routingKeys: {
            events: 'test.database.event'
        }
    },
    indexationManager: {
        queues: {
            events: 'test_indexation_event'
        },
        prefetch: 1
    },
    logs: {
        transport: ['console']
    },
    debug: true
};
