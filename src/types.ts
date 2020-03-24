import {Channel} from 'amqplib';

export interface IFullTreeContent {
    [index: number]: {order: number; record: any; children: IFullTreeContent[]};
}

// export interface IRMQCfg {
//     rootKey: string;
//     channel?: Channel;
//     exchange?: string;
//     routingKey?: string;
// }

export interface IRMQMsg {
    event: string;
    time: number;
    pathAfter: string;
    pathBefore: string;
    inode: number;
    isDirectory: boolean;
    rootKey: any;
}
