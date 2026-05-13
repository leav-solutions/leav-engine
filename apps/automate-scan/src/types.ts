import {type Channel} from 'amqplib';

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

    /**
     * For environments where fs events are not supported well (e.g. network drives)
     */
    usePolling?: boolean;
    /**
     * Only when usePolling is true, interval to poll for changes in milliseconds
     */
    pollingInterval?: number;
}

export interface IConfig {
    allowFilesList: string;
    ignoreFilesList: string;
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
    watcher?: IWatcherParams;
}

export interface IParams {
    rootPath: string;
    rootKey: string;
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
    hash: string;
}
