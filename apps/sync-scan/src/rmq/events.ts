// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {generateMsg, send} from '.';
import {getConfig} from '../config';
import {EventTypes} from '../_types/events';

const _logEvent = (params: {eventType: EventTypes; pathBefore?: string; pathAfter?: string}) => {
    console.info('Event detected', params);
};

export const create = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.ConfirmChannel,
    hash?: string
) => {
    const cfg = await getConfig();

    await send(cfg.rmq, generateMsg(EventTypes.CREATE, null, path, inode, isDirectory, cfg.rmq.rootKey, hash), channel);
    _logEvent({eventType: EventTypes.CREATE, pathAfter: path});
};

export const remove = async (path: string, inode: number, isDirectory: boolean, channel: amqp.ConfirmChannel) => {
    const cfg = await getConfig();

    await send(cfg.rmq, generateMsg(EventTypes.REMOVE, path, null, inode, isDirectory, cfg.rmq.rootKey), channel);
    _logEvent({eventType: EventTypes.REMOVE, pathBefore: path});
};

export const move = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.ConfirmChannel
) => {
    const cfg = await getConfig();

    await send(
        cfg.rmq,
        generateMsg(EventTypes.MOVE, pathBefore, pathAfter, inode, isDirectory, cfg.rmq.rootKey),
        channel
    );
    _logEvent({eventType: EventTypes.MOVE, pathBefore, pathAfter});
};

export const update = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.ConfirmChannel,
    hash: string
) => {
    const cfg = await getConfig();

    await send(cfg.rmq, generateMsg(EventTypes.UPDATE, path, path, inode, isDirectory, cfg.rmq.rootKey, hash), channel);
    _logEvent({eventType: EventTypes.UPDATE, pathAfter: path, pathBefore: path});
};
