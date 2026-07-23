import {type IAmqpChannel, type IAmqpMessage} from '@leav/message-broker';
import {type IConfig} from '../../types/types';
import {sendResponse} from '../sendResponse/sendResponse';
import {processPreview} from './../../processPreview/processPreview';
import {logger} from '@leav/logger';

export const consume = async (
    requestChannel: IAmqpChannel,
    responseChannel: IAmqpChannel,
    config: IConfig,
): Promise<void> => {
    await requestChannel.consume(config.amqp.consume.queue, msg => handleMsg(msg, responseChannel, config));
};

export const handleMsg = async (msg: IAmqpMessage, responseChannel: IAmqpChannel, config: IConfig): Promise<void> => {
    try {
        const response = await processPreview(msg, config);

        await sendResponse(responseChannel, config.amqp.publish, response);
    } catch (err) {
        logger.error(`Con ${(err as Error).message}`);
    }
};
