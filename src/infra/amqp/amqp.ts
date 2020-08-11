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
