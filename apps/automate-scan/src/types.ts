// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    verbose?: boolean | 'very';
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
    watcher?: {
        awaitWriteFinish: {
            stabilityThreshold: number;
            pollInterval: number;
        };
    };
    verbose?: IWatcherParams['verbose'];
}

export interface IParams {
    rootPath: string;
    rootKey: string;
    verbose: IWatcherParams['verbose'];
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
