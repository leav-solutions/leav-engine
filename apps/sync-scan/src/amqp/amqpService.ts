// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqpMsg} from '_types/amqp';

export const publish = async (
    exchange: string,
    routingKey: string,
    channel: amqp.ConfirmChannel,
    msg: IAmqpMsg
): Promise<void> => {
    await channel.checkExchange(exchange);
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)));
    await channel.waitForConfirms();
};
