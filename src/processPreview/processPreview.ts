import {ConsumeMessage} from 'amqplib';
import {handleCheck} from '../check/handleCheck';
import {IConfig, IMessageConsume, IResponse, IResult} from '../types/types';
import {generatePreview} from './../generatePreview/generatePreview';
import {getFileType} from './getFileType/getFileType';
import {getMsgContent} from './getMsgContent/getMsgContent';

export const processPreview = async (msg: ConsumeMessage, config: IConfig): Promise<IResponse> => {
    let msgContent: IMessageConsume;

    try {
        msgContent = getMsgContent(msg);
    } catch (e) {
        return e;
    }

    if (config.verbose) {
        console.info('input:', msgContent.input);
    }

    let type: string;
    let results: IResult[];

    try {
        await handleCheck(msgContent, config);

        type = getFileType(msgContent.input);

        results = await generatePreview(msgContent, type, config);
    } catch (e) {
        const {error, params} = e;
        const result: IResult = {error, params};

        return {
            results: [result],
            context: msgContent.context,
        };
    }

    return {
        results,
        context: msgContent.context,
    };
};
