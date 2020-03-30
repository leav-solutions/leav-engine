import * as amqp from 'amqplib';
import {Config} from '../_types/config';
import config from '../config';
import {generateMsgRabbitMQ, sendToRabbitMQ} from '.';

export const create = async (path: string, inode: number, isDirectory: boolean, channel: amqp.Channel) => {
    try {
        const conf = await config;

        await sendToRabbitMQ(generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, conf.rmq.rootKey), channel);
    } catch (e) {
        throw e;
    }
};

export const remove = async (path: string, inode: number, isDirectory: boolean, channel: amqp.Channel) => {
    try {
        const conf = await config;

        await sendToRabbitMQ(generateMsgRabbitMQ('REMOVE', path, null, inode, isDirectory, conf.rmq.rootKey), channel);
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
        const conf: Config = await config;

        await sendToRabbitMQ(
            generateMsgRabbitMQ('MOVE', pathBefore, pathAfter, inode, isDirectory, conf.rmq.rootKey),
            channel
        );
    } catch (e) {
        throw e;
    }
};
