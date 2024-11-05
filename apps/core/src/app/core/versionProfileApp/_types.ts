// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPaginationParams, SortOrder} from '_types/list';
import {ISystemTranslation} from '_types/systemTranslation';

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
