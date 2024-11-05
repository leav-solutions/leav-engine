// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    server: {
        host: '0.0.0.0',
        port: 7357,
        admin: {
            login: 'admin',
            password: 'admin',
            email: 'email@domain.com'
        }
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
    tasksManager: {
        queues: {
            orders: 'test_tasks_orders'
        },
        routingKeys: {
            orders: 'test.tasks.orders'
        }
    },
    logs: {
        transport: 'console'
    },
    debug: true,
    redis: {
        database: 1
    }
};
