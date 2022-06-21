import * as amqp from 'amqplib';
export interface IAmqp {
    connOpt: amqp.Options.Connect;
    exchange: string;
    type: string;
    prefetch?: number;
}
export interface IAmqpConn {
    connection: amqp.Connection;
    channel: amqp.ConfirmChannel;
}
export interface IMessageBody {
    [key: string]: any;
}
export declare type onMessageFunc = (msg: string) => Promise<void>;
