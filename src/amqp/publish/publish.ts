import {Channel} from 'amqplib';
import {IResponse} from '../../types';

export const sendResponse = async (
    channel: Channel,
    responses: IResponse[],
    {
        exchange,
        routingKey
    }: {
        exchange: string;
        routingKey: string;
    }
) => {
    const buffer = Buffer.from(JSON.stringify(responses));
    return channel.publish(exchange, routingKey, buffer);
};
