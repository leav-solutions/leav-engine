import {getFileType} from '@leav/utils';
import {type IAmqpMessage} from '@leav/message-broker';
import {handleCheck} from '../check/handleCheck';
import {type IConfig, type IMessageConsume, type IResponse, type IResult} from '../types/types';
import {generatePreview} from './../generatePreview/generatePreview';
import {logger} from '@leav/logger';

export const processPreview = async (msg: IAmqpMessage, config: IConfig): Promise<IResponse> => {
    let msgContent: IMessageConsume;
    try {
        msgContent = JSON.parse(msg.content.toString());
    } catch {
        throw new Error(`Invalid message ${msg.content.toString()}`);
    }

    if (config.verbose) {
        logger.info(`input: ${msgContent.input}`);
    }

    let type: string;
    let results: IResult[];

    try {
        await handleCheck(msgContent, config);
        type = getFileType(msgContent.input);
        results = await generatePreview(msgContent, type, config);
    } catch (e) {
        // is not a custom error
        if (typeof e.params === 'undefined') {
            logger.error(`Error in processPreview: ${e.stack}`);
        }

        const {error, params} = e;
        const result: IResult = {error, params};

        return {
            results: [result],
            context: msgContent.context,
            input: msgContent.input,
        };
    }

    return {
        results,
        context: msgContent.context,
        input: msgContent.input,
    };
};
