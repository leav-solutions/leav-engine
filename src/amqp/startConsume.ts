import * as amqp from 'amqplib/callback_api';
import {Options, Channel} from 'amqplib';
import {IConfig} from '../types';
import {initAmqp} from './init/init';
import {consume} from './consume/consume';

export const startConsume = async (config: IConfig) => {
    const amqpConfig: Options.Connect = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password
    };

    const channel: Channel = await getChannel(amqpConfig);
    // init queue where get message
    await initAmqp(channel, config.amqp.consume);

    // init queue where send response
    await initAmqp(channel, config.amqp.publish);

    return consume(channel, config);
};

export const getChannel = async (amqpConfig: Options.Connect) =>
    new Promise<Channel>(resolve =>
        amqp.connect(amqpConfig, async (error0: any, connection: amqp.Connection | any) => {
            if (error0) {
                console.error("101 - Can't connect to rabbitMQ");
                process.exit(101);
            }

            return resolve(connection.createChannel());
        })
    );
