// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {loadConfig} from '@leav/config-manager';
import * as rootPath from 'app-root-path';
import {env} from '../env';
import {IConfig} from '../types/types';

let initialized = false;
let config: IConfig;

export const getConfig = async (): Promise<IConfig> => {
    if (!initialized) {
        config = await loadConfig<IConfig>(rootPath.path + '/apps/preview-generator/config', env);

        initialized = true;
        return config;
    } else {
        return config;
    }
};
