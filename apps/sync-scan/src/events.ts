// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {getConfig} from './config';
import {EventTypes, IEventMsg} from './_types/events';

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
    hash?: string,
    recordId?: string
): IEventMsg => {
    return {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey,
        ...(!!hash && {hash}),
        ...(!!recordId && {recordId})
    };
};

export const create = async (path: string, inode: number, isDirectory: boolean, amqp: IAmqpService, hash?: string) => {
    const cfg = await getConfig();

    await amqp.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        JSON.stringify(_getEventMsg(EventTypes.CREATE, null, path, inode, isDirectory, cfg.amqp.rootKey, hash))
    );

    _logEvent({eventType: EventTypes.CREATE, pathAfter: path});
};

export const remove = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    recordId: string,
    amqp: IAmqpService
) => {
    const cfg = await getConfig();

    await amqp.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        JSON.stringify(
            _getEventMsg(EventTypes.REMOVE, path, null, inode, isDirectory, cfg.amqp.rootKey, null, recordId)
        )
    );

    _logEvent({eventType: EventTypes.REMOVE, pathBefore: path});
};

export const move = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    isDirectory: boolean,
    recordId: string,
    amqp: IAmqpService
) => {
    const cfg = await getConfig();

    await amqp.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        JSON.stringify(
            _getEventMsg(EventTypes.MOVE, pathBefore, pathAfter, inode, isDirectory, cfg.amqp.rootKey, recordId)
        )
    );

    _logEvent({eventType: EventTypes.MOVE, pathBefore, pathAfter});
};

export const update = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    amqp: IAmqpService,
    hash: string,
    recordId: string
) => {
    const cfg = await getConfig();

    await amqp.publish(
        cfg.amqp.exchange,
        cfg.amqp.routingKey,
        JSON.stringify(
            _getEventMsg(EventTypes.UPDATE, path, path, inode, isDirectory, cfg.amqp.rootKey, hash, recordId)
        )
    );

    _logEvent({eventType: EventTypes.UPDATE, pathAfter: path, pathBefore: path});
};
