// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
 * Accepted fields to filter version profiles list
 */
export interface IVersionProfileFilterOptions extends ICoreEntityFilterOptions {
    trees?: string;
}

export interface IGetCoreVersionProfileParams extends IGetCoreEntitiesParams {
    filters?: IVersionProfileFilterOptions;
}
