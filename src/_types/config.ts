export interface IConfig {
    server: IServer;
    db: IDb;
    elasticsearch: IElasticsearch;
    auth: IAuth;
    lang: ILang;
    logs: ILogs;
    permissions: IPermissions;
    amqp: IAmqp;
    filesManager: IFilesManager;
    indexationManager: IIndexationManager;
    debug?: boolean;
    env?: string;
}

export interface IServer {
    host: string;
    port: number;
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
}

export interface ILang {
    available: string[];
    default: string;
}

export interface ILogs {
    level: string;
    transport: string[];
    destinationFile: string;
}

export interface IPermissions {
    default: boolean;
}

export interface IAmqp {
    host: string;
    port: string;
    user: string;
    password: string;
    exchange: string;
    type: string;
}

export interface IQueues {
    filesEvents: string;
    previewRequest: string;
    previewResponse: string;
}

export interface IFilesManager {
    queues: IQueues;
    userId: string;
    prefetch?: number;
}

export interface IIndexationManager {
    queue: string;
    prefetch?: number;
}
