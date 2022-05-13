// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {exec} from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {
    ApplicationInstallStatuses,
    APPS_INSTANCES_FOLDER,
    APPS_MODULES_FOLDER,
    IApplication,
    IApplicationInstall
} from '../../_types/application';

export interface IApplicationService {
    runInstall(params: {application: IApplication; ctx: IQueryInfos}): Promise<IApplicationInstall>;
}

export const APPLICATION_INSTALL_SCRIPT_NAME = 'app_install.sh';

interface IDeps {
    'core.utils'?: IUtils;
    config?: IConfig;
}

export default function ({'core.utils': utils = null, config}: IDeps = {}): IApplicationService {
    const _execCommand = (scriptPath: string, env: {}): Promise<{exitCode: number; out: string}> => {
        return new Promise((resolve, reject) => {
            const child = exec(scriptPath, {env: {...process.env, ...env}, cwd: path.dirname(scriptPath)});
            let out = '';

            child.stdout.on('data', data => {
                out += data;
            });
            child.stderr.on('data', data => {
                out += data;
            });

            child.on('error', err => {
                reject(err);
            });

            child.on('close', exitCode => {
                if (exitCode) {
                    reject(out);
                }

                resolve({exitCode, out});
            });
        });
    };

    return {
        async runInstall({application}): Promise<IApplicationInstall> {
            const rootPath = appRootPath();
            const appFolder = path.resolve(
                rootPath,
                config.applications.rootFolder,
                APPS_MODULES_FOLDER,
                application.module
            );
            const destinationFolder = path.resolve(
                rootPath,
                config.applications.rootFolder,
                APPS_INSTANCES_FOLDER,
                application.id
            );
            const scriptPath = `${appFolder}/${APPLICATION_INSTALL_SCRIPT_NAME}`;

            try {
                const fd = await fs.open(scriptPath, 'r');
                await fd.close();
            } catch (err) {
                return {
                    status: ApplicationInstallStatuses.ERROR,
                    lastCallResult: err.message
                };
            }

            // Define env variables
            const leavEnv = {
                LEAV_API_URL: `${config.server.publicUrl}/${config.server.apiEndpoint}`,
                LEAV_DEFAULT_LANG: config.lang.default,
                LEAV_AVAILABLE_LANG: config.lang.available.join(','),
                LEAV_LOGIN_ENDPOINT: utils.getFullApplicationEndpoint('login'),
                LEAV_APP_ENDPOINT: utils.getFullApplicationEndpoint(application.endpoint),
                LEAV_APPLICATION_ID: application.id,
                LEAV_DEST_FOLDER: destinationFolder
            };

            try {
                const res = await _execCommand(`${scriptPath}`, leavEnv);

                return {status: ApplicationInstallStatuses.SUCCESS, lastCallResult: String(res.out)};
            } catch (err) {
                return {status: ApplicationInstallStatuses.ERROR, lastCallResult: String(err)};
            }
        }
    };
}
