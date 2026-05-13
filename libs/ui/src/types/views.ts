import {type SortOrder, type ViewSizes, type ViewTypes} from '_ui/_gqlTypes';
import {type SystemTranslation} from './scalars';
import {type IFilter} from './search';
import {type IValueVersion} from './values';

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
    sort?: IGetViewListSort[];
    attributes?: string[];
}

export interface IViewDisplay {
    type: ViewTypes;
    size?: ViewSizes;
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
    size?: ViewSizes;
    type: ViewTypes;
}
