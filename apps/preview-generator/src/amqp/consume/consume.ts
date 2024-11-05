// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
        try {
            const response = await processPreview(msg, config);

            await sendResponse(channel, config.amqp.publish, response);
        } catch (err) {
            console.error(err);
        } finally {
            channel.ack(msg);
        }
    }
};
