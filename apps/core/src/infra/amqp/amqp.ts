// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAmqpConn} from '_types/amqp';
import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export async function initAmqp({config}: IDeps): Promise<IAmqpConn> {
    const connection = await amqp.connect(config.amqp.connOpt);
    const channel = await connection.createConfirmChannel();
    await channel.assertExchange(config.amqp.exchange, config.amqp.type);

    return {connection, channel};
}
