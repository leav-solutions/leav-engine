import {loadConfig} from '@leav/config-manager';
import {env} from '../env';
import {type IConfig} from '../types/types';
import path from 'path';

let initialized = false;
let config: IConfig;

export const getConfig = async (): Promise<IConfig> => {
    if (!initialized) {
        config = await loadConfig<IConfig>(path.join(__dirname, '../../config'), env);

        initialized = true;
        return config;
    } else {
        return config;
    }
};
