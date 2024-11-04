// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Options} from 'amqplib';

export interface IConfig {
    allowFilesList: string;
    ignoreFilesList: string;
    graphql: IConfigGraphql;
    filesystem: IConfigFilesystem;
    amqp: IConfigAmqp;
}

export interface IConfigGraphql {
    uri: string;
    apiKey: string;
    treeId: string;
}

export interface IConfigFilesystem {
    absolutePath: string;
}

export interface IConfigAmqp {
    connOpt: Options.Connect;
    exchange: string;
    type: string;
    routingKey: string;
    rootKey: string;
    queue?: string;
    prefetch?: number;
}
