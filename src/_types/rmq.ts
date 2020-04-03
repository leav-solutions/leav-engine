import {Connection, Channel} from 'amqplib';

export interface RMQConn {
    connection: Connection;
    channel: Channel;
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
