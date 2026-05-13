import {type IRecordFilterLight, type IRecordSortLight} from './record';
import {type ISystemTranslation} from './systemTranslation';

export enum ViewTypes {
    LIST = 'list',
    CARDS = 'cards',
    TIMELINE = 'timeline',
}

export enum ViewSizes {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    BIG = 'BIG',
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
    attributes: string[];
}

export interface IViewValuesVersionForGraphql {
    treeId: string;
    treeNode: {id: string};
}

export type ViewFromGraphQL = Omit<IView, 'valuesVersions' | 'settings'> & {
    valuesVersions: IViewValuesVersionForGraphql[];
};

export type PartialViewFromGraphQL = Omit<IView, 'id' | 'valuesVersions' | 'settings'> & {
    id: string;
    valuesVersions: IViewValuesVersionForGraphql[];
};

export interface IViewFilterOptions extends ICoreEntityFilterOptions {
    created_by?: string;
    library?: string;
    type?: ViewTypes;
}
