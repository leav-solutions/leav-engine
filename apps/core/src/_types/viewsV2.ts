// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IRecordFilterLight, type IRecordSortLight} from './record';
import {type ISystemTranslation} from './systemTranslation';

export enum ViewV2Types {
    LIST = 'list',
    CARDS = 'cards',
    TIMELINE = 'timeline',
}

export enum ViewV2Sizes {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    BIG = 'BIG',
}

interface IViewV2Display {
    type: ViewV2Types;
    size: ViewV2Sizes;
}

interface IViewV2ValuesVersion {
    [treeId: string]: string;
}

export interface IViewV2 extends ICoreEntity {
    shared?: boolean;
    created_by?: string;
    created_at?: number;
    modified_at?: number;
    library?: string;
    description?: ISystemTranslation;
    color?: string;
    display?: IViewV2Display;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    valuesVersions?: IViewV2ValuesVersion;
    attributes: string[];
}

export interface IViewV2ValuesVersionForGraphql {
    treeId: string;
    treeNode: {id: string};
}

export type ViewV2FromGraphQL = Omit<IViewV2, 'valuesVersions' | 'settings'> & {
    valuesVersions: IViewV2ValuesVersionForGraphql[];
};

export type PartialViewV2FromGraphQL = Omit<IViewV2, 'id' | 'valuesVersions' | 'settings'> & {
    id: string;
    valuesVersions: IViewV2ValuesVersionForGraphql[];
};

export interface IViewV2FilterOptions extends ICoreEntityFilterOptions {
    created_by?: string;
    library?: string;
    type?: ViewV2Types;
}
