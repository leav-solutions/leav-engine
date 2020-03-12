import {Channel} from 'amqplib';

export interface IAmqpParams {
    channel?: Channel;
    exchange?: string;
    routingKey?: string;
}

export interface IWatcherParams {
    awaitWriteFinish?: {
        stabilityThreshold?: number;
        pollInterval: 100;
    };
    delay?: number;
    verbose?: boolean;
}

export interface IConfig {
    rootPath: string;
    rootKey?: string;
    redis: {
        host: string;
        port: number;
    };
    amqp?: {
        protocol: string;
        hostname: string;
        port: number;
        username: string;
        password: string;
        queue: string;
        exchange: string;
        routingKey: string;
        type: string;
    };
    watcher?: {
        awaitWriteFinish: {
            stabilityThreshold: number;
            pollInterval: number;
        };
    };
    verbose?: boolean;
}

export interface IParams {
    rootPath: string;
    rootKey: string;
    verbose: boolean;
    amqp?: IAmqpParams;
}

export interface IParamsExtends extends IParams {
    delay?: number;
    ready?: boolean;
}

export interface IMessageSend {
    event: string;
    time: number;
    pathAfter: string;
    pathBefore: string;
    inode: number;
    isDirectory: boolean;
    rootKey: any;
}
