// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Options} from 'amqplib';

export interface IConfig {
    graphql: IConfigGraphql;
    filesystem: IConfigFilesystem;
    amqp: IConfigAmqp;
}

export interface IConfigGraphql {
    uri: string;
    token: string;
    treeId: string;
}

export interface IConfigFilesystem {
    absolutePath: string;
}

export interface IConfigAmqp {
    connOpt: Options.Connect;
    queue: string;
    exchange: string;
    routingKey: string;
    rootKey: string;
    type: string;
}
