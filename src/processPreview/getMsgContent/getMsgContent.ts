import {ConsumeMessage} from 'amqplib';

export const getMsgContent = (msg: ConsumeMessage) => {
    try {
        return JSON.parse(msg.content.toString());
    } catch (e) {
        console.error("Can't parse message");
        throw {
            results: [
                {
                    error_code: 6,
                    error: "can't parse message",
                    params: null,
                },
            ],
            context: null,
        };
    }
};
