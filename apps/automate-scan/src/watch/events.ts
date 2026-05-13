import {logger} from '@leav/logger';
import {generateMsgRabbitMQ, sendToRabbitMQ} from '../rabbitmq/rabbitmq';
import {deleteData, updateData} from '../redis/redis';
import {type IParams} from '../types';

export const handleCreate = async (
    path: string,
    inode: number,
    params: IParams,
    isDirectory: boolean,
    hashFile?: string,
) => {
    await updateData(path, inode);
    sendToRabbitMQ(
        generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, params.rootKey, hashFile),
        params.amqp,
    );
    logger.debug(`CREATE ${path}`);
    return true;
};

export const handleDelete = async (path: string, inode: number, params: IParams, isDirectory: boolean) => {
    await deleteData(path);
    sendToRabbitMQ(generateMsgRabbitMQ('REMOVE', path, null, inode, isDirectory, params.rootKey), params.amqp);
    logger.debug(`REMOVE ${path}`);
    return true;
};

export const handleUpdate = async (
    path: string,
    inode: number,
    params: IParams,
    isDirectory: boolean,
    hashFile?: string,
) => {
    await updateData(path, inode);
    sendToRabbitMQ(
        generateMsgRabbitMQ('UPDATE', path, path, inode, isDirectory, params.rootKey, hashFile),
        params.amqp,
    );
    logger.debug(`UPDATE ${path}`);
    return true;
};

export const handleMove = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    params: IParams,
    isDirectory: boolean,
) => {
    await updateData(pathAfter, inode, pathBefore);
    sendToRabbitMQ(generateMsgRabbitMQ('MOVE', pathBefore, pathAfter, inode, isDirectory, params.rootKey), params.amqp);

    logger.debug(`MOVE ${pathBefore} ${pathAfter}`);

    return true;
};
