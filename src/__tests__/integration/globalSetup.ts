import {existsSync} from 'fs';
import {Channel, Options} from 'amqplib';
import {start} from './../../start';
import {config} from '../../config';
import {getChannel} from './../../amqp/getChannel/getChannel';

import configIntegration = require('../../../config/config_integration.json');

export async function setup() {
    try {
        const conf: any = await config;

        // Do whatever you need to setup your integration tests
        const amqpConfig: Options.Connect = {
            protocol: configIntegration.amqp.protocol,
            hostname: configIntegration.amqp.hostname,
            username: configIntegration.amqp.username,
            password: configIntegration.amqp.password,
        };

        const channel: Channel = await getChannel(amqpConfig);

        await channel.assertQueue(configIntegration.amqp.consume.queue, {durable: true});
        await new Promise(res => setImmediate(res));

        await start('./config/config_integration.json');
    } catch (e) {
        console.error(e);
    }
}
