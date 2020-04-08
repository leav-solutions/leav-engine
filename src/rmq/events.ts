import * as amqp from 'amqplib';
import {Config} from '../_types/config';
import config from '../config';
import {generateMsgRabbitMQ, sendToRabbitMQ} from '.';

export const create = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.Channel,
    hash?: string
) => {
    try {
        const cfg: Config = await config;

        await sendToRabbitMQ(
            cfg,
            generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, cfg.rmq.rootKey, hash),
            channel
        );
    } catch (e) {
        throw e;
    }
};

export const remove = async (path: string, inode: number, isDirectory: boolean, channel: amqp.Channel) => {
    try {
        const cfg: Config = await config;

        await sendToRabbitMQ(
            cfg,
            generateMsgRabbitMQ('REMOVE', path, null, inode, isDirectory, cfg.rmq.rootKey),
            channel
        );
    } catch (e) {
        throw e;
    }
};

export const move = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.Channel
) => {
    try {
        const cfg: Config = await config;

        await sendToRabbitMQ(
            cfg,
            generateMsgRabbitMQ('MOVE', pathBefore, pathAfter, inode, isDirectory, cfg.rmq.rootKey),
            channel
        );
    } catch (e) {
        throw e;
    }
};

export const update = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.Channel,
    hash: string
) => {
    try {
        const cfg: Config = await config;

        await sendToRabbitMQ(
            cfg,
            generateMsgRabbitMQ('UPDATE', path, path, inode, isDirectory, cfg.rmq.rootKey, hash),
            channel
        );
    } catch (e) {
        throw e;
    }
};
