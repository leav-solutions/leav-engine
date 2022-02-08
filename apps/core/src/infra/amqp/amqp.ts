// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import amqplib from 'amqplib';
import {IAmqpConn} from '_types/amqp';
import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export async function initAmqp({config}: IDeps): Promise<{publisher: IAmqpConn; consumer: IAmqpConn}> {
    const publisherConnection = await amqplib.connect(config.amqp.connOpt);
    const publisherChannel = await publisherConnection.createConfirmChannel();
    await publisherChannel.assertExchange(config.amqp.exchange, config.amqp.type);
    await publisherChannel.prefetch(config.amqp.prefetch);

    const consumerConnection = await amqplib.connect(config.amqp.connOpt);
    const consumerChannel = await consumerConnection.createConfirmChannel();
    await consumerChannel.assertExchange(config.amqp.exchange, config.amqp.type);
    await consumerChannel.prefetch(config.amqp.prefetch);

    return {
        publisher: {connection: publisherConnection, channel: publisherChannel},
        consumer: {connection: consumerConnection, channel: consumerChannel}
    };
}
