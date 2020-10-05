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
        connOpt: {
            hostname: 'message_broker'
        },
        exchange: 'test_leav_core',
        type: 'direct'
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
    debug: true
};
