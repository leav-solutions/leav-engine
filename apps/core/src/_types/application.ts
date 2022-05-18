// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecord} from './record';
import {IGetCoreEntitiesParams, IKeyValue} from './shared';
import {ISystemTranslation} from './systemTranslation';

export const APPS_MODULES_FOLDER = 'modules';
export const APPS_INSTANCES_FOLDER = 'instances';
export const APPS_URL_PREFIX = 'app';

export enum ApplicationInstallStatuses {
    NONE = 'NONE',
    RUNNING = 'RUNNING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS'
}

export enum ApplicationTypes {
    INTERNAL = 'internal',
    EXTERNAL = 'external'
}

export interface IApplicationInstall {
    status: ApplicationInstallStatuses;
    lastCallResult?: string;
}

export interface IApplication extends ICoreEntity {
    system?: boolean;
    description: ISystemTranslation;
    type: ApplicationTypes;
    libraries: string[];
    trees: string[];
    color?: string;
    icon?: IRecord;
    module: string;
    endpoint: string;
    install?: IApplicationInstall;
    settings?: IKeyValue<any>;
}

/**
 * Accepted fields to filter attributes list
 */
export interface IApplicationFilterOptions extends ICoreEntityFilterOptions {
    endpoint?: string;
    component?: string;
    color?: string;
}

export interface IGetCoreApplicationsParams extends IGetCoreEntitiesParams {
    filters?: IApplicationFilterOptions;
}

export interface IApplicationModule {
    id: string;
    description: string;
    version: string;
}
