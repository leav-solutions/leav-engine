import {type Channel, type ConsumeMessage} from 'amqplib';
import {type IConfig} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {processPreview} from './../../processPreview/processPreview';
import {logger} from '@leav/logger';

export const consume = async (channel: Channel, config: IConfig) => {
    await channel.prefetch(1); // number of message handle in the same time
    await channel.consume(config.amqp.consume.queue, async msg => handleMsg(msg, channel, config), {noAck: false});
};

export const handleMsg = async (msg: ConsumeMessage, channel: Channel, config: IConfig) => {
    if (msg.content) {
        try {
            const response = await processPreview(msg, config);

            await sendResponse(channel, config.amqp.publish, response);
        } catch (err) {
            logger.error(`Con ${(err as Error).message}`);
        } finally {
            channel.ack(msg);
        }
    }
};
