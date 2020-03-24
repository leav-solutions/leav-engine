import {generateMsgRabbitMQ, sendToRabbitMQ} from '.';
import {Channel} from 'amqplib';
import config from '../config';

export const create = async (path: string, inode: number, isDirectory: boolean, channel: Channel) => {
    const conf = await config;

    await sendToRabbitMQ(generateMsgRabbitMQ('CREATE', null, path, inode, isDirectory, conf.rmq.rootKey), channel);
};

export const remove = async (path: string, inode: number, isDirectory: boolean, channel: Channel) => {
    const conf = await config;

    await sendToRabbitMQ(generateMsgRabbitMQ('REMOVE', path, null, inode, isDirectory, conf.rmq.rootKey), channel);
};

// export const rename = async (path: string, inode: number, isDirectory: boolean, channel: Channel) => {
//     const conf = await config;

//     await sendToRabbitMQ(generateMsgRabbitMQ('UPDATE', path, path, inode, isDirectory, conf.rmq.rootKey), channel);
// };

export const move = async (
    pathBefore: string,
    pathAfter: string,
    inode: number,
    isDirectory: boolean,
    channel: Channel
) => {
    const conf = await config;

    await sendToRabbitMQ(
        generateMsgRabbitMQ('MOVE', pathBefore, pathAfter, inode, isDirectory, conf.rmq.rootKey),
        channel
    );
};
