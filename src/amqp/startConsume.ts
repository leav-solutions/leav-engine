import {Options} from 'amqplib';
import {IConfig} from '../types/types';
import {initAmqp} from './init/init';
import {consume} from './consume/consume';
import {getChannel} from './getChannel/getChannel';

export const startConsume = async (config: IConfig) => {
    const amqpConfig: Options.Connect = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password,
    };

    const channel = await getChannel(amqpConfig);

    // init queue where get message
    await initAmqp(channel, config.amqp.consume);

    // init queue where send response
    await initAmqp(channel, config.amqp.publish);

    return consume(channel, config);
};
