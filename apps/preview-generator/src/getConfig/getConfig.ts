import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import {env} from '../env';
import {type IConfig} from '../types/types';

let initialized = false;
let config: IConfig;

export const getConfig = async (): Promise<IConfig> => {
    if (!initialized) {
        config = await loadConfig<IConfig>(appRootPath() + '/config', env);

        initialized = true;
        return config;
    } else {
        return config;
    }
};
