// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecord} from './record';
import {IGetCoreEntitiesParams, IKeyValue} from './shared';
import {ISystemTranslation} from './systemTranslation';

export const APPS_URL_PREFIX = 'app';

export enum ApplicationTypes {
    INTERNAL = 'internal',
    EXTERNAL = 'external'
}

export interface IApplication extends ICoreEntity {
    system?: boolean;
    description: ISystemTranslation;
    type: ApplicationTypes;
    color?: string;
    icon?: IRecord;
    module: string;
    endpoint: string;
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

export enum ApplicationEventTypes {
    SAVE = 'SAVE',
    DELETE = 'DELETE'
}

export interface IApplicationEvent {
    type: ApplicationEventTypes;
    application: IApplication;
}

export interface IApplicationEventFilters {
    applicationId: string;
    events: ApplicationEventTypes[];
}
