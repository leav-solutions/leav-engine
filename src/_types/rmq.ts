import * as amqp from 'amqplib';

export interface RMQConn {
    connection: amqp.Connection;
    channel: amqp.Channel;
}

export interface RMQMsg {
    event: string;
    time: number;
    pathAfter: string;
    pathBefore: string;
    inode: number;
    isDirectory: boolean;
    hash?: string;
    rootKey: string;
}
