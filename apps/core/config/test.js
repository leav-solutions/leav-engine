// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    server: {
        host: process.env.SERVER_HOST || '0.0.0.0',
        port: process.env.SERVER_PORT || 7357
    },
    db: {
        name: process.env.DB_NAME || 'leav_test'
    },
    amqp: {
        exchange: 'test_leav_core',
        prefetch: 1
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
