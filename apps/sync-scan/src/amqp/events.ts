// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqpConn, IAmqpMsg} from '_types/amqp';
import {amqpService} from '.';
import {getConfig} from '../config';
import {EventTypes} from '../_types/events';

const _logEvent = (params: {eventType: EventTypes; pathBefore?: string; pathAfter?: string}) => {
    console.info('Event detected', params);
};

const _getEventMsg = (
    event: EventTypes,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string,
    hash?: string
): IAmqpMsg => {
    return {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey,
        hash
    };
};

export const create = async (path: string, inode: number, isDirectory: boolean, amqpConn: IAmqpConn, hash?: string) => {
    const cfg = await getConfig();

    await amqpService.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        amqpConn,
        _getEventMsg(EventTypes.CREATE, null, path, inode, isDirectory, cfg.amqp.rootKey, hash)
    );

    _logEvent({eventType: EventTypes.CREATE, pathAfter: path});
};

export const remove = async (path: string, inode: number, isDirectory: boolean, amqpConn: IAmqpConn) => {
    const cfg = await getConfig();

    await amqpService.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        amqpConn,
        _getEventMsg(EventTypes.REMOVE, path, null, inode, isDirectory, cfg.amqp.rootKey)
    );

    _logEvent({eventType: EventTypes.REMOVE, pathBefore: path});
};

export const move = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    isDirectory: boolean,
    amqpConn: IAmqpConn
) => {
    const cfg = await getConfig();

    await amqpService.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        amqpConn,
        _getEventMsg(EventTypes.MOVE, pathBefore, pathAfter, inode, isDirectory, cfg.amqp.rootKey)
    );

    _logEvent({eventType: EventTypes.MOVE, pathBefore, pathAfter});
};

export const update = async (path: string, inode: number, isDirectory: boolean, amqpConn: IAmqpConn, hash: string) => {
    const cfg = await getConfig();

    await amqpService.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        amqpConn,
        _getEventMsg(EventTypes.UPDATE, path, path, inode, isDirectory, cfg.amqp.rootKey, hash)
    );

    _logEvent({eventType: EventTypes.UPDATE, pathAfter: path, pathBefore: path});
};
