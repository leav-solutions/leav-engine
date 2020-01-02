import {ErrorPreview} from './../../types/ErrorPreview';
import {ConsumeMessage} from 'amqplib';

export const getMsgContent = (msg: ConsumeMessage) => {
    try {
        return JSON.parse(msg.content.toString());
    } catch (e) {
        console.error("Can't parse message");
        throw new ErrorPreview({
            error: 201,
        });
    }
};
