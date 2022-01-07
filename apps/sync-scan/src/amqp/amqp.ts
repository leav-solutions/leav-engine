// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqpConn} from '_types/amqp';
import {IConfigAmqp} from '_types/config';

export async function init(config: IConfigAmqp): Promise<IAmqpConn> {
    const connection = await amqp.connect(config.connOpt);
    const channel = await connection.createConfirmChannel();
    await channel.assertExchange(config.exchange, config.type, {durable: true});

    return {connection, channel};
}
