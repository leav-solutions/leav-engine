// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SortOrder, ViewSizes, ViewTypes} from '_ui/_gqlTypes';
import {SystemTranslation} from './scalars';
import {IFilter} from './search';
import {IValueVersion} from './values';

export interface IView {
    id: string;
    library?: string;
    label: SystemTranslation;
    display: IViewDisplay;
    owner: boolean;
    shared: boolean;
    description?: SystemTranslation;
    color?: string;
    filters?: IFilter[];
    valuesVersions?: IValueVersion;
    settings?: IGetViewListSettings[];
    sort?: IGetViewListSort;
}

export interface IViewDisplay {
    type: ViewTypes;
    size: ViewSizes;
}

export interface IGetViewListSort {
    field: string;
    order: SortOrder;
}

export interface IGetViewListSettings {
    name: string;
    value?: any;
}

export interface IGetViewListDisplay {
    size: ViewSizes;
    type: ViewTypes;
}
