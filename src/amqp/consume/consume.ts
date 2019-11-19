import * as path from 'path';
import {Channel, ConsumeMessage} from 'amqplib';
import {IConfig, IResponse} from '../../types';
import {checkFile} from '../../generate';
import {sendResponse} from '../publish/publish';

export const consume = async (channel: Channel, config: IConfig) =>
    channel.consume(config.amqp.consume.queue, msg => handleMsg(msg, channel, config), {noAck: true});

export const handleMsg = async (msg: ConsumeMessage, channel: Channel, config: IConfig) => {
    if (msg.content) {
        const {input, output, sizes} = JSON.parse(msg.content.toString());

        // get the absolute path for input and output
        [input, output].forEach(p => (p = path.join(config.rootPath, p)));

        const response: IResponse[] = checkFile(input, output, sizes);

        sendResponse(channel, response, config.amqp.publish);
    }
};
