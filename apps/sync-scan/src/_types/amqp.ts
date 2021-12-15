// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {EventTypes} from './events';

export interface IAmqpConn {
    connection: amqp.Connection;
    channel: amqp.ConfirmChannel;
}

export interface IAmqpMsg {
    event: EventTypes;
    time: number;
    pathAfter: string;
    pathBefore: string;
    inode: number;
    isDirectory: boolean;
    hash?: string;
    rootKey: string;
}
