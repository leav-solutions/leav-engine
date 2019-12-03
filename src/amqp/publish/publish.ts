import {Channel} from 'amqplib';
import {IResult} from '../../types';

interface IProps {
    exchange: string;
    routingKey: string;
}

export const sendResponse = async (
    channel: Channel,
    responses: IResult[],
    {exchange, routingKey}: IProps,
    context: any,
) => {
    const buffer = Buffer.from(JSON.stringify({responses, context}));
    return channel.publish(exchange, routingKey, buffer);
};
