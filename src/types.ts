import {Channel} from 'amqplib';

export interface IAmqpParams {
    channel?: Channel;
    exchange?: string;
    routingKey?: string;
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
