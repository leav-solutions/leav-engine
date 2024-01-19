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
