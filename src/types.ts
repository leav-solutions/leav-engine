import {Channel} from 'amqplib';

export interface IFullTreeContent {
    [index: number]: {order: number; record: any; children: IFullTreeContent[]};
}

export interface IAmqpParams {
    channel?: Channel;
    exchange?: string;
    routingKey?: string;
}

export interface IParams {
    rootPath: string;
    rootKey: string;
    verbose: boolean;
    amqp?: IAmqpParams;
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
