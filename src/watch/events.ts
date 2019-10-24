import {sendToRabbitMQ, generateMsgRabbitMQ} from '../rabbitmq/rabbitmq';
import {updateData, deleteData} from '../redis/redis';
import {IParams} from '../types';

export const handleCreate = async (path: string, inode: number, params: IParams) => {
    await updateData(path, inode);
    sendToRabbitMQ(generateMsgRabbitMQ('create', null, path, inode, params.rootKey), params.amqp);
    if (params.verbose) {
        console.info('create', path);
    }
    return true;
};

export const handleDelete = async (path: string, inode: number, params: IParams) => {
    await deleteData(path);
    sendToRabbitMQ(generateMsgRabbitMQ('delete', path, null, inode, params.rootKey), params.amqp);
    if (params.verbose) {
        console.info('delete', path);
    }
    return true;
};

export const handleUpdate = async (path: string, inode: number, params: IParams) => {
    await updateData(path, inode);
    sendToRabbitMQ(generateMsgRabbitMQ('update', path, path, inode, params.rootKey), params.amqp);
    if (params.verbose) {
        console.info('update', path);
    }
    return true;
};

export const handleMove = async (pathBefore: string, pathAfter: string, inode: number, params: IParams) => {
    await updateData(pathAfter, inode, pathBefore);
    sendToRabbitMQ(generateMsgRabbitMQ('move', pathBefore, pathAfter, inode, params.rootKey), params.amqp);
    if (params.verbose) {
        console.info('move', pathBefore, pathAfter);
    }
    return true;
};
