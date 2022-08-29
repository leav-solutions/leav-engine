// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {aql} from 'arangojs';
import {exec} from 'child_process';
import {R_OK} from 'constants';
import fs from 'fs/promises';
import {IDbService} from 'infra/db/dbService';
import path from 'path';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {
    ApplicationInstallStatuses,
    APPS_INSTANCES_FOLDER,
    APPS_MODULES_FOLDER,
    IApplication,
    IApplicationInstall
} from '../../_types/application';
import {IApplicationRepo} from './applicationRepo';

export interface IApplicationService {
    runInstall(params: {application: IApplication; ctx: IQueryInfos}): Promise<IApplicationInstall>;
    runUninstall(params: {application: IApplication; ctx: IQueryInfos}): Promise<boolean>;
    runInstallAll(): void;
    runUninstallAll(): void;
}

export const APPLICATION_INSTALL_SCRIPT_NAME = 'app_install.sh';
export const APPLICATION_UNINSTALL_SCRIPT_NAME = 'app_uninstall.sh';

interface IDeps {
    'core.infra.application'?: IApplicationRepo;
    'core.utils'?: IUtils;
    'core.utils.logger'?: winston.Winston;
    config?: IConfig;
}

export default function ({
    'core.infra.application': applicationRepo = null,
    'core.utils': utils = null,
    'core.utils.logger': logger = null,
    config
}: IDeps = {}): IApplicationService {
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

    const _getInstancesFolder = (rootPath: string): string => {
        return path.resolve(rootPath, config.applications.rootFolder, APPS_INSTANCES_FOLDER);
    };

    const _getDestinationFolder = (applicationId: string, rootPath: string): string => {
        return path.resolve(_getInstancesFolder(rootPath), applicationId);
    };

    const _createInstanceFolder = async (instanceFolderPath: string) => {
        try {
            await fs.mkdir(instanceFolderPath);
        } catch (err) {
            if (err.code === 'EEXIST') {
                return;
            }

            logger.error(err);
            throw err;
        }
    };

    const _runInstall = async ({application}): Promise<IApplicationInstall> => {
        const rootPath = appRootPath();
        const appFolder = path.resolve(
            rootPath,
            config.applications.rootFolder,
            APPS_MODULES_FOLDER,
            application.module
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

        // Make sure instances folder exists
        const instanceFolderPath = _getInstancesFolder(rootPath);
        try {
            await fs.stat(instanceFolderPath);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                await _createInstanceFolder(instanceFolderPath);
            } else {
                logger.error(err);
                throw err;
            }
        }

        // Define env variables
        const leavEnv = {
            LEAV_API_URL: `${config.server.publicUrl}/${config.server.apiEndpoint}`,
            LEAV_AUTH_URL: `${config.server.publicUrl}/auth/authenticate`,
            LEAV_DEFAULT_LANG: config.lang.default,
            LEAV_AVAILABLE_LANG: config.lang.available.join(','),
            LEAV_LOGIN_ENDPOINT: utils.getFullApplicationEndpoint('login'),
            LEAV_APP_ENDPOINT: utils.getFullApplicationEndpoint(application.endpoint),
            LEAV_APPLICATION_ID: application.id,
            LEAV_DEST_FOLDER: _getDestinationFolder(application.id, rootPath)
        };
        const timer = logger.startTimer();
        try {
            logger.info(`START build of ${application.id}`);
            const res = await _execCommand(`${scriptPath}`, leavEnv);
            timer.done(`END build of ${application.id}, `);
            return {status: ApplicationInstallStatuses.SUCCESS, lastCallResult: String(res.out)};
        } catch (err) {
            timer.done(`ERROR build of ${application.id}, `);
            logger.error(String(err));
            return {status: ApplicationInstallStatuses.ERROR, lastCallResult: String(err)};
        }
    };

    const _runUninstall = async ({application}): Promise<boolean> => {
        const rootPath = appRootPath();
        const appFolder = path.resolve(
            rootPath,
            config.applications.rootFolder,
            APPS_MODULES_FOLDER,
            application.module
        );
        const destinationFolder = _getDestinationFolder(application.id, rootPath);

        // Check if an uninstall script exists. If so, run it before removing the folder
        const scriptPath = `${appFolder}/${APPLICATION_UNINSTALL_SCRIPT_NAME}`;

        let doesScriptExist: boolean;
        try {
            await fs.access(scriptPath, R_OK);
            doesScriptExist = true;
        } catch (err) {
            doesScriptExist = false;
        }
        const timer = logger.startTimer();
        if (doesScriptExist) {
            const leavEnv = {
                LEAV_APPLICATION_ID: application.id,
                LEAV_DEST_FOLDER: _getDestinationFolder(application.id, rootPath)
            };
            logger.info(`START uninstall of ${application.id}`);
            await _execCommand(`${scriptPath}`, leavEnv);
        }

        // Remove destination folder
        await fs.rm(destinationFolder, {recursive: true, force: true});
        timer.done(`END uninstall of ${application.id}, `);
        return true;
    };

    return {
        runInstall: _runInstall,
        runUninstall: _runUninstall,
        async runInstallAll() {
            const ctx: IQueryInfos = {
                userId: '1',
                queryId: 'applicationService_runInstallAll'
            };
            const allApps = await applicationRepo.getApplications({ctx});
            logger.info(
                `${allApps.list.length} application(s) to build (${allApps.list
                    .map(application => application.id)
                    .join(', ')})`
            );
            for (const application of allApps.list) {
                const res = await _runInstall({application});
            }
        },
        async runUninstallAll() {
            const ctx: IQueryInfos = {
                userId: '1',
                queryId: 'applicationService_runUninstallAll'
            };
            const allApps = await applicationRepo.getApplications({ctx});
            logger.info(
                `${allApps.list.length} application(s) to uninstall (${allApps.list
                    .map(application => application.id)
                    .join(', ')})`
            );
            for (const application of allApps.list) {
                const res = await _runUninstall({application});
            }
        }
    };
}
