import {Channel, ConsumeMessage} from 'amqplib';
import {IConfig} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {processPreview} from './../../processPreview/processPreview';

export const consume = async (channel: Channel, config: IConfig) => {
    await channel.prefetch(1); // number of message handle in the same time
    await channel.consume(config.amqp.consume.queue, async msg => handleMsg(msg, channel, config), {noAck: false});
};

export const handleMsg = async (msg: ConsumeMessage, channel: Channel, config: IConfig) => {
    if (msg.content) {
        const response = await processPreview(msg, config);

        await sendResponse(channel, config.amqp.publish, response);

        channel.ack(msg);
    }
};
