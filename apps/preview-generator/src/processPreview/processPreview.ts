// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getFileType} from '@leav/utils';
import {ConsumeMessage} from 'amqplib';
import {handleCheck} from '../check/handleCheck';
import {IConfig, IMessageConsume, IResponse, IResult} from '../types/types';
import {generatePreview} from './../generatePreview/generatePreview';

export const processPreview = async (msg: ConsumeMessage, config: IConfig): Promise<IResponse> => {
    let msgContent: IMessageConsume;
    try {
        msgContent = JSON.parse(msg.content.toString());
    } catch (err) {
        throw new Error(`Invalid message ${msg.content.toString()}`);
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
        // is not a custom error
        if (typeof e.params === 'undefined') {
            console.error(e);
        }

        const {error, params} = e;
        const result: IResult = {error, params};

        return {
            results: [result],
            context: msgContent.context,
            input: msgContent.input
        };
    }

    return {
        results,
        context: msgContent.context,
        input: msgContent.input
    };
};
