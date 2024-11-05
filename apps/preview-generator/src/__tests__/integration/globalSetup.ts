// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {startConsume} from 'amqp/startConsume';
import {Channel, Options} from 'amqplib';
import {getConfig} from '../../getConfig/getConfig';
import {getChannel} from './../../amqp/getChannel/getChannel';

export async function setup() {
    try {
        const conf = await getConfig();

        // Do whatever you need to setup your integration tests
        const amqpConfig: Options.Connect = {
            protocol: conf.amqp.protocol,
            hostname: conf.amqp.hostname,
            username: conf.amqp.username,
            password: conf.amqp.password
        };

        const channel: Channel = await getChannel(amqpConfig);

        await channel.assertQueue(conf.amqp.consume.queue, {durable: true});
        await new Promise(res => setImmediate(res));

        await startConsume(conf);
    } catch (e) {
        console.error(e);
    }
}
