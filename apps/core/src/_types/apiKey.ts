// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetCoreEntitiesParams} from './shared';

export interface IApiKey {
    id?: string;
    label: string;
    key?: string;
    createdAt?: number;
    createdBy?: string;
    modifiedAt?: number;
    modifiedBy?: string;
    expiresAt: number;
    userId: string;
}

/**
 * Accepted fields to filter api keys list
 */
export interface IApiKeyFilterOptions extends Omit<ICoreEntityFilterOptions, 'system'> {
    userId?: string;
    createdBy?: string;
    modifiedBy?: string;
}

export interface IGetCoreApiKeysParams extends IGetCoreEntitiesParams {
    filters?: IApiKeyFilterOptions;
}
