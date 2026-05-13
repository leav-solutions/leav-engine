import {type Options} from 'amqplib';

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
