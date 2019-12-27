import {Channel} from 'amqplib';
import {IResult, ErrorList} from '../../types';

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
    const responseWithErrorReason = responses.map(r =>
        ErrorList[r.error] ? {...r, error_detail: ErrorList[r.error]} : r,
    );

    const buffer = Buffer.from(JSON.stringify({responses: responseWithErrorReason, context}));

    return channel.publish(exchange, routingKey, buffer);
};
