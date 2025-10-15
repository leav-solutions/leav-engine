// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const {envToBool, envToNumber} = require('@leav/config-manager');

module.exports = {
    instanceId: process.env.INSTANCE_ID || 'leav_engine',
    coreMode: process.env.CORE_MODE || 'server',
    server: {
        host: process.env.SERVER_HOST || 'localhost',
        port: envToNumber(process.env.SERVER_PORT, 4001),
        keepAliveTimeout: envToNumber(process.env.SERVER_KEEP_ALIVE_TIMEOUT, 60000),
        publicUrl: process.env.SERVER_PUBLIC_URL || 'http://localhost:4001',
        basePath: process.env.SERVER_BASE_PATH || '',
        allowIntrospection: envToBool(process.env.SERVER_ALLOW_INTROSPECTION, false),
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
    dataLoaders: {
        valueRepo: {
            getValues: {
                enableCache: envToBool(process.env.DATA_LOADERS_VALUE_REPO_GET_VALUES_ENABLE_CACHE, false), // keep for test for now, may be remove in future
                useBatch: envToBool(process.env.DATA_LOADERS_VALUE_REPO_GET_VALUES_USE_BATCH, true) // for rollback compatibility, keep it true
            }
        }
    },
    auth: {
        scheme: 'jwt',
        key: process.env.AUTH_KEY,
        algorithm: 'HS256',
        tokenExpiration: process.env.TOKEN_TTL || '15m',
        refreshTokenExpiration: process.env.REFRESH_TOKEN_TTL || '2h',
        cookie: {
            sameSite: process.env.AUTH_COOKIE_SAMESITE || 'lax',
            secure: envToBool(process.env.AUTH_COOKIE_SECURE, true)
        },
        resetPasswordExpiration: process.env.AUTH_RESET_PWD_TTL || '20m',
        oidc: {
            enable: envToBool(process.env.OIDC_ENABLE, false),
            wellKnownEndpoint:
                process.env.OIDC_WELLKNOWN_ENDPOINT ||
                'http://keycloak:8080/realms/LEAV/.well-known/openid-configuration',
            clientId: process.env.OIDC_CLIENT_ID || 'leav',
            postLogoutRedirectUri: process.env.OIDC_POST_LOGOUT_REDIRECT_URI || 'http://localhost:4001',
            skipLogoutConfirmationPage: envToBool(process.env.OIDC_SKIP_LOGOUT_CONFIRMATION_PAGE, false),
            idTokenUserClaim: process.env.ID_TOKEN_USER_CLAIM || 'email',
            enableAutoProvisioning: envToBool(process.env.OIDC_ENABLE_AUTO_PROVISIONING, false)
        },
        testApiKey: process.env.TEST_API_KEY // /!\ do not use in production /!\
    },
    mailer: {
        host: process.env.MAILER_HOST || 'localhost',
        port: envToNumber(process.env.MAILER_PORT, 587),
        secure: envToBool(process.env.MAILER_SECURE, false), // if true the connection will use TLS when connecting to server.
        // If false (the default) then TLS is used if server supports the STARTTLS extension.
        // In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
        auth: {
            user: process.env.MAILER_AUTH_USER,
            password: process.env.MAILER_AUTH_PWD
        }
    },
    bugsnag: {
        enable: envToBool(process.env.BUGSNAG_ENABLE, false),
        apiKey: process.env.BUGSNAG_API_KEY,
        appVersion: process.env.BUGSNAG_APP_VERSION,
        appType: process.env.BUGSNAG_APP_TYPE || 'core',
        releaseStage: process.env.BUGSNAG_RELEASE_STAGE || 'production'
    },
    matomo: {
        enable: envToBool(process.env.MATOMO_ENABLE, false),
        url: process.env.MATOMO_URL || '//analytics.aristid.com/',
        siteId: process.env.MATOMO_SITE_ID || ''
    },
    lang: {
        available: process.env.LANG_AVAILABLE || ['fr', 'en'],
        default: process.env.LANG_DEFAULT || 'en'
    },
    permissions: {
        default: true,
        enableCache: envToBool(process.env.PERMISSIONS_ENABLE_CACHE, true)
    },
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
        prefetch: envToNumber(process.env.AMQP_PREFETCH, 5)
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        database: envToNumber(process.env.REDIS_DATABASE, 0)
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
        allowFilesList: process.env.ALLOW_FILES_LIST || '',
        ignoreFilesList: process.env.IGNORE_FILES_LIST || ''
    },
    tasksManager: {
        checkingInterval: 3000,
        workerPrefetch: 1,
        restartWorker: envToBool(process.env.TM_RESTART_WORKER, false),
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
    debug: envToBool(process.env.DEBUG, false),
    defaultUserId: '2', // Used for DB migration and any other action that is not bound to a real user
    export: {
        directory: process.env.EXPORT_DIR || '/exports',
        endpoint: process.env.EXPORT_ENDPOINT || 'exports'
    },
    import: {
        directory: process.env.IMPORT_DIR || '/imports',
        endpoint: process.env.IMPORT_ENDPOINT || 'imports',
        sizeLimit: envToNumber(process.env.IMPORT_SIZE_LIMIT, 10), // megabytes
        groupData: envToNumber(process.env.IMPORT_GROUP_DATA, 50), // number of elements processed at the same time,
        maxStackedElements: envToNumber(process.env.IMPORT_MAX_STACKED_ELEMENTS, 10000), // We clear the parser value stack based on the number of elements present
        delayTaskExecMs: envToNumber(process.env.IMPORT_DELAY_TASK_EXEC_MS, 0) // Delay to ensure file is written in nfs due to async behavior
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
        enable: envToBool(process.env.DB_PROFILER_ENABLE, false)
    },
    elasticsearch: {
        indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'leav-logs-',
        url: process.env.ELASTICSEARCH_URL || process.env.ELASTIC_SEARCH_URL || 'http://elasticsearch:9200',
        ilmPolicyName: process.env.ELASTICSEARCH_ILM_POLICY_NAME || 'leav-logs-policy',
        templateName: process.env.ELASTICSEARCH_TEMPLATE_NAME || 'leav-logs-template'
    },
    logsCollector: {
        queue: process.env.LOGS_MANAGER_QUEUE || 'logs_events'
    },
    pluginsPath: process.env.PLUGINS_PATH || []
};
