// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordFilterLight, IRecordSortLight} from './record';
import {ISystemTranslation} from './systemTranslation';

export enum ViewTypes {
    LIST = 'list',
    CARDS = 'cards',
    TIMELINE = 'timeline'
}

export enum ViewSizes {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    BIG = 'BIG'
}

interface IViewDisplay {
    type: ViewTypes;
    size: ViewSizes;
}

interface IViewValuesVersion {
    [treeId: string]: string;
}

export interface IView extends ICoreEntity {
    shared?: boolean;
    created_by?: string;
    created_at?: number;
    modified_at?: number;
    library?: string;
    description?: ISystemTranslation;
    color?: string;
    display?: IViewDisplay;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    valuesVersions?: IViewValuesVersion;
    attributes?: string[];
}

export interface IViewValuesVersionForGraphql {
    treeId: string;
    treeNode: {id: string};
}

export type ViewFromGraphQL = Omit<IView, 'valuesVersions' | 'settings'> & {
    valuesVersions: IViewValuesVersionForGraphql[];
};

export interface IViewFilterOptions extends ICoreEntityFilterOptions {
    created_by?: string;
    library?: string;
    type?: ViewTypes;
}
