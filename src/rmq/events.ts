import * as amqp from 'amqplib';
import {generateMsgRabbitMQ, sendToRabbitMQ} from '.';

export const create = async (
    path: string,
    inode: number,
    isDirectory: boolean,
    channel: amqp.Channel,
    hash?: string
) => {
    try {
        await sendToRabbitMQ(
            generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, process.env.RMQ_ROOTKEY, hash),
            channel
        );
    } catch (e) {
        throw e;
    }
};

export const remove = async (path: string, inode: number, isDirectory: boolean, channel: amqp.Channel) => {
    try {
        await sendToRabbitMQ(
            generateMsgRabbitMQ('REMOVE', path, null, inode, isDirectory, process.env.ROOTKEY),
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
        await sendToRabbitMQ(
            generateMsgRabbitMQ('MOVE', pathBefore, pathAfter, inode, isDirectory, process.env.ROOTKEY),
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
        await sendToRabbitMQ(
            generateMsgRabbitMQ('UPDATE', path, path, inode, isDirectory, process.env.ROOTKEY, hash),
            channel
        );
    } catch (e) {
        throw e;
    }
};
