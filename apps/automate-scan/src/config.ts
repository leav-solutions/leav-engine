import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import {type IConfig} from './types';
import {env} from './env';

export const getConfig = async (): Promise<IConfig> => loadConfig<IConfig>(appRootPath() + '/config', env);
