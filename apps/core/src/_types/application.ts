// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetCoreEntitiesParams} from './shared';
import {ISystemTranslation} from './systemTranslation';

export interface IApplication extends ICoreEntity {
    system?: boolean;
    description: ISystemTranslation;
    libraries: string[];
    trees: string[];
    color?: string;
    icon?: string;
    component: string;
    endpoint: string;
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
