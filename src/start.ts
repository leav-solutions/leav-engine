import {startConsume} from './amqp/startConsume';
import {getConfig} from './getConfig/getConfig';

export const start = async (configPath: string) => {
    const config = getConfig(configPath);

    await startConsume(config);
};
