import {startConsume} from './amqp/startConsume';
import {getConfig} from './getConfig/getConfig';

export const start = async () => {
    const config = await getConfig();

    await startConsume(config);
};
