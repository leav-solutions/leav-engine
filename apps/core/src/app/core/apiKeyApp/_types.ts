// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IApiKeyFilterOptions} from '_types/apiKey';
import {IPaginationParams, SortOrder} from '_types/list';

export interface IApiKeysArgs {
    filters?: IApiKeyFilterOptions;
    pagination: IPaginationParams;
    sort: {
        field: 'id';
        order: SortOrder;
    };
}

export interface ISaveApiKeyArgs {
    apiKey: {
        id: string;
        label: string;
        expiresAt: number;
        userId: string;
    };
}

export interface IDeleteApiKeyArgs {
    id: string;
}
