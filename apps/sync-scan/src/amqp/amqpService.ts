// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpConn, IAmqpMsg} from '_types/amqp';
import * as amqp from './amqp';
import {getConfig} from '../config';
import {IConfig} from '../_types/config';

let retry = 0;

export const publish = async (
    exchange: string,
    routingKey: string,
    amqpConn: IAmqpConn,
    msg: IAmqpMsg
): Promise<void> => {
    await amqpConn.channel.checkExchange(exchange);
    amqpConn.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)));
    await amqpConn.channel.waitForConfirms();

    try {
        await amqpConn.channel.close();
        await amqpConn.channel.checkExchange(exchange);
        amqpConn.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)));
        await amqpConn.channel.waitForConfirms();
    } catch (e) {
        const cfg: IConfig = await getConfig();

        if (!retry) {
            retry += 1;
            amqpConn = await amqp.init(cfg.amqp);
            await publish(exchange, routingKey, amqpConn, msg);
        } else {
            throw new Error('2 tries reached. Stop sync.');
        }
    }
};
