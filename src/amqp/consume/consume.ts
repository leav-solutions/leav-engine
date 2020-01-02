import {Channel, ConsumeMessage} from 'amqplib';
import {IConfig} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {processPreview} from './../../processPreview/processPreview';

export const consume = async (channel: Channel, config: IConfig) =>
    channel.consume(config.amqp.consume.queue, async msg => handleMsg(msg, channel, config), {noAck: false});

export const handleMsg = async (msg: ConsumeMessage, channel: Channel, config: IConfig) => {
    if (msg.content) {
        const {results, context} = await processPreview(msg, config);

        await sendResponse(channel, results, config.amqp.publish, context);

        channel.ack(msg);
    }
};
