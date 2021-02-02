import {Options} from 'amqplib';

export interface IConfig {
    graphql: IConfigGraphql;
    filesystem: IConfigFilesystem;
    rmq: IConfigAmqp;
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
