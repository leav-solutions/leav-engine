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
    timeout?: number;
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
    };
    watcher?: {
        awaitWriteFinish: {
            stabilityThreshold: number;
            pollIntervak: number;
        };
    };
    verbose?: boolean;
}

export interface IParams {
    rootKey: string;
    verbose: boolean;
    amqp?: IAmqpParams;
}

export interface IParamsExtends extends IParams {
    timeout?: number;
    ready?: boolean;
}
