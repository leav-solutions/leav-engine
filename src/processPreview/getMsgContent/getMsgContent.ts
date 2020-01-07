import {handleError} from './../../utils/log';
import {ErrorPreview} from './../../types/ErrorPreview';
import {ConsumeMessage} from 'amqplib';

export const getMsgContent = (msg: ConsumeMessage) => {
    try {
        return JSON.parse(msg.content.toString());
    } catch (e) {
        const errorId = handleError(e);

        throw new ErrorPreview({
            error: 201,
            params: {
                errorId,
            },
        });
    }
};
