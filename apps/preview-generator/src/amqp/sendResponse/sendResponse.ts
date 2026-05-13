import {type Channel} from 'amqplib';
import {ErrorList} from '../../errors/ErrorList';
import {type IResponse} from '../../types/types';

interface IProps {
    exchange: string;
    routingKey: string;
}

export const sendResponse = async (channel: Channel, {exchange, routingKey}: IProps, response: IResponse) => {
    // Add error_detail
    const resultsWithErrorReason = response.results.map(r => ({error_detail: ErrorList[r.error] ?? '', ...r}));

    const buffer = Buffer.from(JSON.stringify({...response, results: resultsWithErrorReason}));

    return channel.publish(exchange, routingKey, buffer, {
        persistent: true,
    });
};
