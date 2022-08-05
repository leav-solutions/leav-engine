// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Options} from 'amqplib';
import {IKeyValue} from './shared';

export interface IConfig {
    server: IServer;
    db: IDb;
    diskCache: IDiskCache;
    elasticsearch: IElasticsearch;
    auth: IAuth;
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
}

export interface IServer {
    host: string;
    port: number;
    publicUrl: string;
    apiEndpoint: string;
    uploadLimit: number | string;
}

export interface IDb {
    url: string;
    name: string;
}

export interface IElasticsearch {
    url: string;
}

export interface IAuth {
    scheme: string;
    key: string;
    algorithm: string;
    tokenExpiration: string;
    cookie: {
        sameSite: 'none' | 'lax' | 'strict';
        secure: boolean;
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
}

export interface IEventsManager {
    routingKeys: {
        events: string;
    };
}

export interface IIndexationManager {
    queues: {
        events: string;
    };
}

export interface ITasksManager {
    checkingInterval: number; // in milliseconds
    queues: {
        orders: string;
    };
    routingKeys: {
        orders: string;
    };
}

export interface IExport {
    directory: string;
}

export interface IImport {
    directory: string;
    sizeLimit: number;
    groupData: number;
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
