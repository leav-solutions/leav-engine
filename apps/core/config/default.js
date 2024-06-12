// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    instanceId: process.env.INSTANCE_ID || 'leav_engine',
    server: {
        host: process.env.SERVER_HOST || 'localhost',
        port: process.env.SERVER_PORT || 4001,
        publicUrl: process.env.SERVER_PUBLIC_URL || 'http://localhost:4001',
        wsUrl: process.env.SERVER_WS_URL || 'ws://localhost:4001',
        allowIntrospection: process.env.SERVER_ALLOW_INTROSPECTION ?? true,
        /**
         * Controls the maximum request body size. If this is a number,
         * then the value specifies the number of bytes; if it is a string,
         * the value is passed to the bytes library for parsing (https://www.npmjs.com/package/bytes).
         */
        uploadLimit: process.env.SERVER_UPLOAD_LIMIT || '100mb',
        supportEmail: process.env.SERVER_SUPPORT_EMAIL,
        admin: {
            login: process.env.SERVER_ADMIN_LOGIN,
            password: process.env.SERVER_ADMIN_PASSWORD,
            email: process.env.SERVER_ADMIN_EMAIL
        },
        systemUser: {
            email: process.env.SERVER_SYSTEM_USER_EMAIL || 'system@leav-engine.com'
        }
    },
    db: {
        url: process.env.ARANGO_URL,
        name: process.env.DB_NAME
    },
    diskCache: {
        directory: process.env.DISK_CACHE_DIRECTORY || '/cache'
    },
    auth: {
        scheme: 'jwt',
        key: process.env.AUTH_KEY,
        algorithm: 'HS256',
        tokenExpiration: process.env.TOKEN_TTL || '15m',
        refreshTokenExpiration: process.env.REFRESH_TOKEN_TTL || '2h',
        cookie: {
            sameSite: process.env.AUTH_COOKIE_SAMESITE || 'lax',
            secure: process.env.AUTH_COOKIE_SECURE || false
        },
        resetPasswordExpiration: process.env.AUTH_RESET_PWD_TTL || '20m',
        oidc: {
            wellKnownEndpoint: 'http://keycloak:8080/realms/master/.well-known/openid-configuration',
            providerUrl: 'http://core.keycloak.localhost/realms/master/protocol/openid-connect/auth',
            clientId: 'leav',
            cookie: {
                sameSite: process.env.AUTH_COOKIE_SAMESITE || 'lax',
                secure: process.env.AUTH_COOKIE_SECURE || false
            }
        }
    },
    mailer: {
        host: process.env.MAILER_HOST || 'localhost',
        port: process.env.MAILER_PORT || 587,
        secure: process.env.MAILER_SECURE || false, // if true the connection will use TLS when connecting to server.
        // If false (the default) then TLS is used if server supports the STARTTLS extension.
        // In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
        auth: {
            user: process.env.MAILER_AUTH_USER,
            password: process.env.MAILER_AUTH_PWD
        }
    },
    lang: {
        available: process.env.LANG_AVAILABLE || ['fr', 'en'],
        default: process.env.LANG_DEFAULT || 'en'
    },
    logs: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.LOG_TRANSPORT || 'console,file', // Comma separated list of transport, including : console, file
        destinationFile: process.env.LOG_FILE // If logging in file
    },
    permissions: {default: true},
    amqp: {
        connOpt: {
            protocol: 'amqp',
            hostname: process.env.AMQP_HOST,
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PWD,
            port: process.env.AMQP_PORT || '5672'
        },
        exchange: process.env.AMQP_EXCHANGE || 'leav_core',
        type: process.env.AMQP_TYPE || 'direct',
        prefetch: process.env.AMQP_PREFETCH || 5
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        database: process.env.REDIS_DATABASE ?? 0
    },
    filesManager: {
        queues: {
            events: process.env.FM_EVENTS_QUEUE || 'files_events',
            previewRequest: process.env.FM_PREVIEW_REQUEST_QUEUE || 'files_preview_request',
            previewResponse: process.env.FM_PREVIEW_RESPONSE_QUEUE || 'files_preview_response'
        },
        routingKeys: {
            events: 'files.event',
            previewRequest: 'files.previewRequest',
            previewResponse: 'files.previewResponse'
        },
        rootKeys: {
            files1: 'files'
        },
        userId: process.env.FM_USER_ID || '2',
        userGroupsIds: process.env.FM_USER_GROUPS_IDS || '2',
        allowFilesList: process.env.ALLOW_FILES_LIST || '',
        ignoreFilesList: process.env.IGNORE_FILES_LIST || ''
    },
    tasksManager: {
        checkingInterval: 3000,
        workerPrefetch: 1,
        restartWorker: process.env.TM_RESTART_WORKER ?? false,
        queues: {
            execOrders: process.env.TM_EXEC_ORDERS_QUEUE || 'tasks_exec_orders',
            cancelOrders: process.env.TM_CANCEL_ORDERS_QUEUE || 'tasks_cancel_orders'
        },
        routingKeys: {
            execOrders: 'tasks.exec.orders',
            cancelOrders: 'tasks.cancel.orders'
        }
    },
    eventsManager: {
        routingKeys: {
            data_events: 'data.events',
            pubsub_events: 'pubsub.events'
        },
        queues: {
            pubsub_events: 'pubsub_events'
        }
    },
    indexationManager: {
        queues: {
            events: 'indexation_events'
        }
    },
    debug: process.env.DEBUG || false,
    defaultUserId: '2', // Used for DB migration and any other action that is not bound to a real user
    export: {
        directory: process.env.EXPORT_DIR || '/exports',
        endpoint: process.env.EXPORT_ENDPOINT || 'exports'
    },
    import: {
        directory: process.env.IMPORT_DIR || '/imports',
        endpoint: process.env.IMPORT_ENDPOINT || 'imports',
        sizeLimit: process.env.IMPORT_SIZE_LIMIT || 10, // megabytes
        groupData: process.env.IMPORT_GROUP_DATA || 50, // number of elements processed at the same time,
        maxStackedElements: process.env.IMPORT_MAX_STACKED_ELEMENTS || 10000 // We clear the parser value stack based on the number of elements present
    },
    preview: {
        directory: process.env.PREVIEWS_DIRECTORY || '/results'
    },
    applications: {
        rootFolder: process.env.APPLICATIONS_FOLDER || 'applications'
    },
    files: {
        rootPaths: process.env.FILES_ROOT_PATHS,
        originalsPathPrefix: process.env.FILES_ORIGINALS_PREFIX || 'originals'
    },
    dbProfiler: {
        enable: typeof process.env.DB_PROFILER_ENABLE !== 'undefined' ? !!Number(process.env.DB_PROFILER_ENABLE) : false
    },
    elasticSearch: {
        url: process.env.ELASTIC_SEARCH_URL || 'http://elasticsearch:9200'
    }
};
