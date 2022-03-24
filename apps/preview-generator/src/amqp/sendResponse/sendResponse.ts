// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Channel} from 'amqplib';
import {ErrorList} from '../../errors/ErrorList';
import {IResponse} from '../../types/types';

interface IProps {
    exchange: string;
    routingKey: string;
}

export const sendResponse = async (channel: Channel, {exchange, routingKey}: IProps, response: IResponse) => {
    // Add error_detail
    const resultsWithErrorReason = response.results.map(r => ({error_detail: ErrorList[r.error] ?? '', ...r}));

    const buffer = Buffer.from(JSON.stringify({...response, results: resultsWithErrorReason}));

    return channel.publish(exchange, routingKey, buffer);
};
