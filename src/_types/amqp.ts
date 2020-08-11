import * as amqp from 'amqplib';

export interface IAmqpConn {
    connection: amqp.Connection;
    channel: amqp.ConfirmChannel;
}

export interface IMessageBody {
    [key: string]: any;
}

export type onMessageFunc = (msg: string) => Promise<void>;
