// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    server: {
        host: process.env.SERVER_HOST || 'localhost',
        port: process.env.SERVER_PORT || 4001,
        publicUrl: process.env.SERVER_PUBLIC_URL || 'http://localhost:4001',
        apiEndpoint: process.env.API_ENDPOINT || 'graphql',
        /**
         * Controls the maximum request body size. If this is a number,
         * then the value specifies the number of bytes; if it is a string,
         * the value is passed to the bytes library for parsing (https://www.npmjs.com/package/bytes).
         */
        uploadLimit: process.env.SERVER_UPLOAD_LIMIT || '100mb'
    },
    db: {
        url: process.env.ARANGO_URL,
        name: process.env.DB_NAME
    },
    diskCache: {
        directory: process.env.DISK_CACHE_DIRECTORY || '/cache'
    },
    elasticsearch: {
        url: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
    },
    auth: {
        scheme: 'jwt',
        key: process.env.AUTH_KEY,
        algorithm: 'HS256',
        tokenExpiration: process.env.TOKEN_TTL || '7d'
    },
    lang: {
        available: process.env.LANG_AVAILABLE || ['fr', 'en'],
        default: process.env.LANG_DEFAULT || 'fr'
    },
    logs: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.LOG_TRANSPORT || ['console', 'file'], // Array containing one or more of : console, file
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
        port: process.env.REDIS_PORT
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
        userId: process.env.FM_USER_ID || '1'
    },
    eventsManager: {
        routingKeys: {
            events: 'database.event'
        }
    },
    indexationManager: {
        queues: {
            events: 'indexation_events'
        }
    },
    debug: process.env.DEBUG || false,
    defaultUserId: '1', // Used for DB migration and any other action that is not bound to a real user
    export: {
        directory: process.env.EXPORT_DIR || '/exports'
    },
    import: {
        directory: process.env.IMPORT_DIR || '/imports',
        sizeLimit: process.env.IMPORT_SIZE_LIMIT || 10, // megabytes
        groupData: process.env.IMPORT_GROUP_DATA || 50 // number of elements processed at the same time
    },
    preview: {
        directory: process.env.PREVIEWS_DIRECTORY || '/results'
    },
    applications: {
        rootFolder: process.env.APPLICATIONS_FOLDER || 'applications'
    }
};
