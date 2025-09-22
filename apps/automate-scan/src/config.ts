// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import {type IConfig} from 'types';
import {env} from './env';

export const getConfig = async (): Promise<IConfig> => loadConfig<IConfig>(appRootPath() + '/config', env);
