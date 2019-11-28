import {getConfig} from './getConfig/getConfig';
import {startConsume} from './amqp/startConsume';

export const start = async (configPath: string) => {
    const config = getConfig(configPath);

    await startConsume(config);
};
