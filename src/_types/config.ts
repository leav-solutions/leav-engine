import {Options} from 'amqplib';
import {IKeyValue} from './shared';

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
    plugins: IKeyValue<IKeyValue<any>>;
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
    connOpt: Options.Connect;
    exchange: string;
    type: string;
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
    prefetch?: number;
}

export interface IIndexationManager {
    queues: {
        events: string;
    };
    routingKeys: {
        events: string;
    };
    prefetch?: number;
}
