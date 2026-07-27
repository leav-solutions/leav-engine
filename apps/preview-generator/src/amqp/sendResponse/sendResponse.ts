import {type IAmqpChannel} from '@leav/message-broker';
import {ErrorList} from '../../errors/ErrorList';
import {type IResponse} from '../../types/types';

interface IProps {
    exchange: string;
    routingKey: string;
}

export const sendResponse = async (
    channel: IAmqpChannel,
    {exchange, routingKey}: IProps,
    response: IResponse,
): Promise<void> => {
    // Add error_detail
    const resultsWithErrorReason = response.results.map(r => ({error_detail: ErrorList[r.error] ?? '', ...r}));

    const payload = JSON.stringify({...response, results: resultsWithErrorReason});

    await channel.publish(exchange, routingKey, payload, {persistent: true});
};
