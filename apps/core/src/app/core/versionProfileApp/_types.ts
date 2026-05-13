import {type IPaginationParams, type SortOrder} from '../../../_types/list';
import {type ISystemTranslation} from '../../../_types/systemTranslation';

export interface IVersionProfilesArgs {
    filters: {
        id?: string;
        label?: string;
    };
    pagination: IPaginationParams;
    sort: {
        field: 'id';
        order: SortOrder;
    };
}

export interface ISaveVersionProfileArgs {
    versionProfile: {
        id: string;
        label: ISystemTranslation;
        description: ISystemTranslation;
        trees: string[];
    };
}

export interface IDeleteVersionProfileArgs {
    id: string;
}
