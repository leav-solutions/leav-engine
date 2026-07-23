import {type IAmqpConnectionOptions} from '@leav/message-broker';

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
    connOpt: IAmqpConnectionOptions;
    heartbeatInSeconds?: number;
    exchange: string;
    type: string;
    routingKey: string;
    rootKey: string;
    queue?: string;
}
