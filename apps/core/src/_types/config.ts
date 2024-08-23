// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Options} from 'amqplib';
import {IKeyValue} from './shared';

export interface IConfig {
    coreMod: CoreMod;
    server: IServer;
    db: IDb;
    diskCache: IDiskCache;
    auth: IAuth;
    mailer: IMailer;
    lang: ILang;
    logs: ILogs;
    permissions: IPermissions;
    amqp: IAmqp;
    redis: IRedis;
    filesManager: IFilesManager;
    indexationManager: IIndexationManager;
    tasksManager: ITasksManager;
    eventsManager: IEventsManager;
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
    elasticSearch: IElasticSearchConfig;
}

export enum CoreMod {
    SERVER = 'server',
    MIGRATE = 'migrate',
    FILES_MANAGER = 'filesManager',
    INDEXATION_MANAGER = 'indexationManager',
    TASKS_MANAGER_MASTER = 'tasksManager:master',
    TASKS_MANAGER_WORKER = 'tasksManager:worker'
}

export interface IServer {
    host: string;
    port: number;
    publicUrl: string;
    allowIntrospection: boolean;
    wsUrl: string;
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
          }
        | {
              enable: true;
              wellKnownEndpoint: string;
              clientId: string;
              postLogoutRedirectUri: string;
          };
}

export interface IMailer {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        password: string;
    };
}

export interface ILang {
    available: string[];
    default: string;
}

export interface ILogs {
    level: string;
    transport: string;
    destinationFile?: string;
}

export interface IPermissions {
    default: boolean;
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
    userId: string;
    userGroupsIds: string;
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

export interface IElasticSearchConfig {
    url: string;
}
