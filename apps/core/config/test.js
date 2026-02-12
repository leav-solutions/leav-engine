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
            email: 'admin@test.leav-engine.com',
        },
        systemUser: {
            email: 'system@test.leav-engine.com',
        },
        allowIntrospection: true,
    },
    db: {
        name: 'leav_test',
    },
    amqp: {
        exchange: 'test_leav_core',
    },
    filesManager: {
        queues: {
            events: 'test_files_events',
            previewRequest: 'test_files_preview_request',
            previewResponse: 'test_files_preview_response',
        },
    },
    eventsManager: {
        routingKeys: {
            data_events: 'test_data.events',
            pubsub_events: 'test_pubsub.events',
        },
        queues: {
            pubsub_events_prefix: 'test_pubsub_events-',
        },
    },
    indexationManager: {
        queues: {
            events: 'test_indexation_event',
        },
    },
    tasksManager: {
        checkingInterval: 20, // reduce latency in tests
        queues: {
            execOrders: 'test_tasks_exec_orders',
            cancelOrders: 'test_task_cancels_orders',
        },
        routingKeys: {
            execOrders: 'test_tasks.exec.orders',
            cancelOrders: 'test_tasks.cancel.orders',
        },
    },
    logs: {
        transport: 'console',
    },
    notification: {
        enable: true,
        email: {
            enable: true,
        },
        webSocket: {
            enable: true,
        },
    },
    mailer: {
        from: {
            name: 'Mailer Test Leav',
            email: 'mailer@test.leav-engine.com',
        },
    },
    debug: true,
    redis: {
        cacheDatabase: 14,
        sessionDatabase: 15,
    },
    pluginsPath: ['/plugins/fakeplugin'],
    applications: {
        rootFolder: 'src/__tests__/e2e/api/_fixtures/applications',
        assetsMaxAge: '42h',
    },
};
