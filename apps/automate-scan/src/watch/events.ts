// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generateMsgRabbitMQ, sendToRabbitMQ} from '../rabbitmq/rabbitmq';
import {deleteData, updateData} from '../redis/redis';
import {IParams} from '../types';

export const handleCreate = async (
    path: string,
    inode: number,
    params: IParams,
    isDirectory: boolean,
    hashFile?: string
) => {
    await updateData(path, inode);
    sendToRabbitMQ(
        generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, params.rootKey, hashFile),
        params.amqp
    );
    if (params.verbose) {
        console.info('CREATE', path);
    }
    return true;
};

export const handleDelete = async (path: string, inode: number, params: IParams, isDirectory: boolean) => {
    await deleteData(path);
    sendToRabbitMQ(generateMsgRabbitMQ('REMOVE', path, null, inode, isDirectory, params.rootKey), params.amqp);
    if (params.verbose) {
        console.info('REMOVE', path);
    }
    return true;
};

export const handleUpdate = async (
    path: string,
    inode: number,
    params: IParams,
    isDirectory: boolean,
    hashFile?: string
) => {
    await updateData(path, inode);
    sendToRabbitMQ(
        generateMsgRabbitMQ('UPDATE', path, path, inode, isDirectory, params.rootKey, hashFile),
        params.amqp
    );
    if (params.verbose) {
        console.info('UPDATE', path);
    }
    return true;
};

export const handleMove = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    params: IParams,
    isDirectory: boolean
) => {
    await updateData(pathAfter, inode, pathBefore);
    sendToRabbitMQ(generateMsgRabbitMQ('MOVE', pathBefore, pathAfter, inode, isDirectory, params.rootKey), params.amqp);

    if (params.verbose) {
        console.info('MOVE', pathBefore, pathAfter);
    }

    return true;
};
