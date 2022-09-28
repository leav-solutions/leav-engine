// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetCoreEntitiesParams} from './shared';
import {ISystemTranslation} from './systemTranslation';

export interface IVersionProfile {
    id: string;
    label: ISystemTranslation;
    description?: ISystemTranslation;
    trees: string[];
}

/**
 * Accepted fields to filter attributes list
 */
export interface IVersionProfileFilterOptions extends ICoreEntityFilterOptions {
    trees?: string;
}

export interface IGetCoreVersionProfileParams extends IGetCoreEntitiesParams {
    filters?: IVersionProfileFilterOptions;
}
