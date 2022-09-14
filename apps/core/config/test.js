// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    server: {
        host: '0.0.0.0',
        port: 7357
    },
    db: {
        name: 'leav_test'
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
            data_events: 'test.data.event'
        }
    },
    indexationManager: {
        queues: {
            events: 'test_indexation_event'
        }
    },
    logs: {
        transport: 'console'
    },
    debug: true,
    redis: {
        host: process.env.REDIS_HOST || 'redis',
        database: 15
    }
};
