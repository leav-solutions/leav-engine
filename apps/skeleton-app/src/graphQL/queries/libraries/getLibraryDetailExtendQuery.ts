// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType, LibraryBehavior, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {
    AttributeConditionType,
    ISystemTranslation,
    OperatorFilter,
    OrderSearch,
    TreeConditionFilter
} from '../../../_types/types';

export interface ILibraryDetailExtendedFilter {
    field?: string;
    value?: string;
    condition?: AttributeConditionType | TreeConditionFilter;
    operator?: OperatorFilter;
}

export interface ILibraryDetailExtendedDefaultView {
    id: string;
    label: string;
    description?: string;
    display: {size: ViewSizes; type: ViewTypes};
    shared: boolean;
    filters?: ILibraryDetailExtendedFilter[];
    color: string;
    sort: {
        field: string;
        order: OrderSearch;
    };
    settings?: Array<{
        name: string;
        value: any;
    }>;
}

export interface ILibraryDetailExtendedAttributeParentLinkedLibrary {
    id: string;
    label: ISystemTranslation;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

export interface ILibraryDetailExtendedAttributeParentLinkedTree {
    id: string;
    label: ISystemTranslation;
    libraries: Array<{
        library: ILibraryDetailExtendedAttributeParentLinkedTreeLibrary;
    }>;
}

export interface ILibraryDetailExtendedAttributeParentLinkedTreeLibrary {
    id: string;
    label: ISystemTranslation;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

interface ILibraryDetailExtendedAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat;
    label: ISystemTranslation;
    multiple_values: boolean;
    system: boolean;
    readonly: boolean;
}

export type ILibraryDetailExtendedAttributeChild = ILibraryDetailExtendedAttribute;

export interface ILibraryDetailExtendedAttributeParent extends ILibraryDetailExtendedAttribute {
    linked_library?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linked_tree?: ILibraryDetailExtendedAttributeParentLinkedTree;
}

export interface ILibraryDetailExtended {
    id: string;
    system: boolean;
    behavior: LibraryBehavior;
    label: ISystemTranslation;
    attributes: ILibraryDetailExtendedAttributeParent[];
    defaultView?: ILibraryDetailExtendedDefaultView;
}
