import * as amqp from 'amqplib';
import {EventTypes} from './events';

export interface IRMQConn {
    connection: amqp.Connection;
    channel: amqp.ConfirmChannel;
}

export interface IRMQMsg {
    event: EventTypes;
    time: number;
    pathAfter: string;
    pathBefore: string;
    inode: number;
    isDirectory: boolean;
    hash?: string;
    rootKey: string;
}
