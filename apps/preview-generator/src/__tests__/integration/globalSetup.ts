import {Channel, Options} from 'amqplib';
import {getConfig} from '../../getConfig/getConfig';
import {getChannel} from './../../amqp/getChannel/getChannel';
import {start} from './../../start';

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

        await start();
    } catch (e) {
        console.error(e);
    }
}
