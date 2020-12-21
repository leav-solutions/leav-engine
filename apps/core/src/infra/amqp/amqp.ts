// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqpConn} from '_types/amqp';

interface IDeps {
    config?: any;
}

export async function initAmqp(deps: IDeps = {}): Promise<IAmqpConn> {
    const connection = await amqp.connect(deps.config.amqp.connOpt);
    const channel = await connection.createConfirmChannel();
    await channel.assertExchange(deps.config.amqp.exchange, deps.config.amqp.type);

    return {connection, channel};
}
