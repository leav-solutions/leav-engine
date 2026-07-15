import {loadConfig} from '@leav/config-manager';
import {type IConfig} from './types';
import {env} from './env';
import path from 'path';

export const getConfig = async (): Promise<IConfig> => loadConfig<IConfig>(path.join(__dirname, '../config'), env);
