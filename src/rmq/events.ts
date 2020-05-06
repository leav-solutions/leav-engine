import * as amqp from 'amqplib';
import {Config} from '../_types/config';
import config from '../config';
import {generateMsg, send} from '.';

export const create = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.ConfirmChannel,
    hash?: string
) => {
    const cfg: Config = await config;
    await send(cfg.rmq, generateMsg('CREATE', null, path, inode, isDirectory, cfg.rmq.rootKey, hash), channel);
};

export const remove = async (path: string, inode: number, isDirectory: boolean, channel: amqp.ConfirmChannel) => {
    const cfg: Config = await config;
    await send(cfg.rmq, generateMsg('REMOVE', path, null, inode, isDirectory, cfg.rmq.rootKey), channel);
};

export const move = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.ConfirmChannel
) => {
    const cfg: Config = await config;
    await send(cfg.rmq, generateMsg('MOVE', pathBefore, pathAfter, inode, isDirectory, cfg.rmq.rootKey), channel);
};

export const update = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.ConfirmChannel,
    hash: string
) => {
    const cfg: Config = await config;
    await send(cfg.rmq, generateMsg('UPDATE', path, path, inode, isDirectory, cfg.rmq.rootKey, hash), channel);
};
