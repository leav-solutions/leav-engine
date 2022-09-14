// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {loadConfig} from '@leav/config-manager';
import {IConfig} from 'types';
import {env} from './env';
import {startWatch} from './setupWatcher/setupWatcher';

export const getConfig = async (): Promise<IConfig> => loadConfig<IConfig>(appRootPath() + '/config', env);

process.on('uncaughtException', err => {
    console.error('1 - There was an uncaught error', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// handle CTRL + C
process.on('SIGINT', () => {
    console.info('0 - User stopped the app');
    process.exit(0);
});

(async () => {
    await startWatch();
})().catch(e => {
    console.error(e);
    process.exit(1);
});
