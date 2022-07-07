// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

export type onMessageFunc = (msg: string) => Promise<void>;
