import {Options} from 'amqplib';

export interface Config {
    graphql: GraphQL;
    filesystem: Filesystem;
    rmq: RMQ;
}

export interface GraphQL {
    uri: string;
    token: string;
    treeId: string;
}

export interface Filesystem {
    absolutePath: string;
}

export interface RMQ {
    connOpt: Options.Connect;
    queue: string;
    exchange: string;
    routingKey: string;
    rootKey: string;
    type: string;
}
