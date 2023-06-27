// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PreviewPriority} from '@leav/utils';
import {Options} from 'amqplib';
import {IConfig} from '../types/types';
import {consume} from './consume/consume';
import {getChannel} from './getChannel/getChannel';
import {initAmqp} from './init/init';

export const startConsume = async (config: IConfig) => {
    const amqpConfig: Options.Connect = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password
    };

    const channel = await getChannel(amqpConfig);

    // init queue where getting preview request messages
    await initAmqp(channel, config.amqp.type, {...config.amqp.consume, maxPriority: PreviewPriority.HIGH});

    // init queue where sending preview result messages
    await initAmqp(channel, config.amqp.type, config.amqp.publish);

    await consume(channel, config);
};
