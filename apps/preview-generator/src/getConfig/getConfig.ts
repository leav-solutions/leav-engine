import {loadConfig} from '@leav-engine/config-manager';
import * as rootPath from 'app-root-path';
import {env} from '../env';
import {IConfig} from '../types/types';

let initialized = false;
let config: IConfig;

export const getConfig = async (): Promise<IConfig> => {
    if (!initialized) {
        config = await loadConfig<IConfig>(rootPath.path + '/config', env);

        initialized = true;
        return config;
    } else {
        return config;
    }
};
