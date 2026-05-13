import {type IApiKeyFilterOptions} from '../../../_types/apiKey';
import {type IPaginationParams, type SortOrder} from '../../../_types/list';

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
