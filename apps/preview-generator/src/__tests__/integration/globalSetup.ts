import {startConsume} from '../../amqp/startConsume';
import {getConfig} from '../../getConfig/getConfig';

export async function setup() {
    try {
        const conf = await getConfig();

        await startConsume(conf);
    } catch (e) {
        console.error(e);
    }
}
