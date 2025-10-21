// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Options} from 'amqplib';
import {type IKeyValue} from './shared';

export interface IConfig {
    coreMode: CoreMode;
    server: IServer;
    db: IDb;
    diskCache: IDiskCache;
    dataLoaders: IDataLoaders;
    auth: IAuth;
    mailer: IMailer;
    lang: ILang;
    permissions: IPermissions;
    amqp: IAmqp;
    redis: IRedis;
    filesManager: IFilesManager;
    indexationManager: IIndexationManager;
    tasksManager: ITasksManager;
    eventsManager: IEventsManager;
    notification: INotificationConfig;
    debug?: boolean;
    env?: string;
    defaultUserId: string;
    export: IExport;
    import: IImport;
    plugins: IKeyValue<IKeyValue<any>>;
    preview: IPreview;
    applications: IApplicationsConfig;
    files: IFilesConfig;
    dbProfiler: IDbProfilerConfig;
    instanceId: string;
    elasticsearch: IElasticsearchConfig;
    logsCollector: ILogsCollector;
    pluginsPath: string[];
    bugsnag: IBugsnag;
    matomo: IMatomo;
}

export enum CoreMode {
    SERVER = 'server',
    MIGRATE = 'migrate',
    FILES_MANAGER = 'filesManager',
    INDEXATION_MANAGER = 'indexationManager',
    TASKS_MANAGER_MASTER = 'tasksManager:master',
    TASKS_MANAGER_WORKER = 'tasksManager:worker',
    LOGS_COLLECTOR = 'logsCollector',
    CLI = 'cli' // default
}

export interface IServer {
    host: string;
    port: number;
    keepAliveTimeout: number;
    publicUrl: string;
    basePath: string;
    allowIntrospection: boolean;
    uploadLimit: number | string;
    supportEmail: string;
    admin: {
        login: string;
        password: string;
        email: string;
    };
    systemUser: {
        email: string;
    };
}

export interface IDb {
    url: string;
    name: string;
}

export interface IAuth {
    scheme: string;
    key: string;
    algorithm: string;
    tokenExpiration: string;
    refreshTokenExpiration: string;
    cookie: {
        sameSite: 'none' | 'lax' | 'strict';
        secure: boolean;
    };
    resetPasswordExpiration: string;
    oidc:
        | {
              enable: false;
              wellKnownEndpoint?: string;
              clientId?: string;
              postLogoutRedirectUri?: string;
              skipLogoutConfirmationPage?: boolean;
              idTokenUserClaim?: string;
          }
        | {
              enable: true;
              wellKnownEndpoint: string;
              clientId: string;
              postLogoutRedirectUri: string;
              skipLogoutConfirmationPage?: boolean;
              idTokenUserClaim: string;
              enableAutoProvisioning: boolean;
          };
    testApiKey?: string;
}

export interface IMailer {
    host: string;
    port: number;
    secure: boolean;
    from: {
        name: string;
        email: string;
    };
    auth: {
        user: string;
        password: string;
    };
}

export interface ILang {
    available: string[];
    default: string;
}

export interface IPermissions {
    default: boolean;
    enableCache: boolean;
}

export interface IAmqp {
    connOpt: Options.Connect;
    exchange: string;
    type: string;
    prefetch?: number;
}

export interface IRedis {
    host: string;
    port: number;
    database: number;
}

export interface IFilesManager {
    queues: {
        events: string;
        previewRequest: string;
        previewResponse: string;
    };
    routingKeys: {
        events: string;
        previewRequest: string;
        previewResponse: string;
    };
    rootKeys: {
        files1: string;
    };
    allowFilesList: string;
    ignoreFilesList: string;
}

export interface IEventsManager {
    routingKeys: {
        data_events: string;
        pubsub_events: string;
    };
    queues: {
        pubsub_events: string;
    };
}

export interface IIndexationManager {
    queues: {
        events: string;
    };
}

export interface ITasksManager {
    checkingInterval: number; // in milliseconds
    workerPrefetch: number;
    restartWorker: boolean;
    queues: {
        execOrders: string;
        cancelOrders: string;
    };
    routingKeys: {
        execOrders: string;
        cancelOrders: string;
    };
}

export interface IExport {
    directory: string;
    endpoint: string;
}

export interface IImport {
    directory: string;
    endpoint: string;
    sizeLimit: number;
    groupData: number;
    maxStackedElements: number;

    /**
     * Hack for leav deploy on nfs which is asynchronous for file write (by default)
     * Wait this delay before submitting import data job
     */
    delayTaskExecMs: number;
}

/**
 * Data loaders configuration for performances
 */
export interface IDataLoaders {
    valueRepo: {
        getValues: {
            /**
             * @default false
             *
             * Enable cache inside data loaders in the query context
             * Before enable, ensure that it has no side effects, for instance on saveValue/deleteValue mutations
             */
            enableCache: boolean;

            /**
             * @default true
             *
             * Enable: do batch arangodb query
             * Disable: do one arangodb query per value, as before data loader use. For rollback if issue with batch query
             * Temporary, to be removed in future
             */
            useBatch: boolean;
        };
    };
}

export interface IDiskCache {
    directory: string;
}

export interface IPreview {
    directory: string;
}

export interface IApplicationsConfig {
    rootFolder: string;
}

export interface IFilesConfig {
    rootPaths: string;
    originalsPathPrefix: string;
}

export interface IDbProfilerConfig {
    enable: boolean;
}

export interface INotificationConfig {
    enable: boolean;
    email: {
        enable: boolean;
    };
    webSocket: {
        enable: boolean;
    };
}

export interface IElasticsearchConfig {
    indexPrefix: string;
    url: string;
    ilmPolicyName: string;
    templateName: string;
}

export interface IBugsnag {
    enable: boolean;
    apiKey?: string;
    appVersion?: string;
    appType?: string;
    releaseStage?: string;
}

export interface IMatomo {
    enable: boolean;
    url?: string;
    siteId?: string;
}

export interface ILogsCollector {
    queue: string;
}
