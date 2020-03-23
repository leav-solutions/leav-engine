import {generateMsgRabbitMQ, sendToRabbitMQ} from '.';
import {IParams} from '../types';

export const create = async (path: string, inode: number, params: IParams, isDirectory: boolean) => {
    sendToRabbitMQ(generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, params.rootKey), params.amqp);

    if (params.verbose) {
        console.info('CREATE', path);
    }

    return true;
};
