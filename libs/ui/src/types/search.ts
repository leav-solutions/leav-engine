// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDateRangeValue} from '@leav/utils';
import {ReactNode} from 'react';
import {
    AttributeFormat,
    AttributesByLibAttributeStandardAttributeFragment,
    AttributeType,
    RecordFilterCondition,
    RecordFilterOperator
} from '_ui/_gqlTypes';
import {
    ILibraryDetailExtendedAttributeParentLinkedLibrary,
    ILibraryDetailExtendedAttributeParentLinkedTree
} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {ValueOf} from './misc';
import {IRecordIdentityWhoAmI} from './records';
import {SystemTranslation} from './scalars';

export type ExtendFormat = string | {[key: string]: ExtendFormat[]};

export interface IParentAttributeData {
    id: string;
    type: AttributeType;
}

export interface ITreeData {
    treeAttributeId: string;
    libraryTypeName: string;
}

export interface IEmbeddedFieldData {
    path: string;
    format: AttributeFormat;
}

export interface IFieldBase {
    id: string;
    library: string;
    label: string;
    key: string;
    format?: AttributeFormat;
    embeddedData?: IEmbeddedFieldData;
    multipleValues?: boolean;
}

export interface IFieldTypeBasic extends IFieldBase {
    type: AttributeType.simple | AttributeType.advanced;
    parentAttributeData?: IParentAttributeData;
}

export interface IFieldTypeLink extends IFieldBase {
    type: AttributeType.simple_link | AttributeType.advanced_link;
    parentAttributeData?: IParentAttributeData;
}

export interface IFieldTypeTree extends IFieldBase {
    type: AttributeType.tree;
    parentAttributeData?: IParentAttributeData;
    recordLibrary?: string;
    treeData?: ITreeData;
}

export type IField = IFieldTypeBasic | IFieldTypeLink | IFieldTypeTree;

export interface IQueryFilter {
    field?: string;
    value?: string;
    condition?: AttributeConditionType | TreeConditionFilter;
    operator?: RecordFilterOperator;
    treeId?: string;
}

export enum SearchOrder {
    DESC = 'DESC',
    ASC = 'ASC'
}

export interface IItemBase {
    fields: {[x: string]: any};
    whoAmI: IRecordIdentityWhoAmI;
    index: number;
}

export type IItem = IItemBase;

export enum FilterType {
    ATTRIBUTE = 'ATTRIBUTE',
    TREE = 'TREE',
    LIBRARY = 'LIBRARY'
}

export enum OperatorFilter {
    AND = 'AND',
    OR = 'OR',
    OPEN_BRACKET = 'OPEN_BRACKET',
    CLOSE_BRACKET = 'CLOSE_BRACKET'
}

export enum TreeConditionFilter {
    CLASSIFIED_IN = 'CLASSIFIED_IN',
    NOT_CLASSIFIED_IN = 'NOT_CLASSIFIED_IN'
}

export enum ThroughConditionFilter {
    THROUGH = 'THROUGH'
}

// We're exporting a const and not an enum to "merge" the enum coming
// from Graphql types with some condition of our own
export const AttributeConditionFilter = {
    ...RecordFilterCondition,
    ...ThroughConditionFilter
};

export type AttributeConditionType = ValueOf<typeof AttributeConditionFilter>;

export interface IAttribute {
    id: string;
    library: string;
    type: AttributeType;
    format?: AttributeFormat;
    label?: SystemTranslation | null;
    isLink: boolean;
    isMultiple: boolean;
    linkedLibrary?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linkedTree?: ILibraryDetailExtendedAttributeParentLinkedTree;
    parentAttribute?: IAttribute;
    embedded_fields?: AttributesByLibAttributeStandardAttributeFragment['embedded_fields'] | null;
}

export interface IFilter {
    type: FilterType;
    index: number; // use to sort the filters
    key: string; // attribute / tree key
    value: {value: boolean | string | number | null | IDateRangeValue; label?: string};
    active: boolean;
    condition: AttributeConditionType | TreeConditionFilter | ThroughConditionFilter;
}

export interface IFilterAttribute extends IFilter {
    attribute: IAttribute; // Put the attribute in the filter to avoid having to fetch them multiple times
    parentTreeLibrary?: IFilterLibrary; // on tree library attribute
}

export interface IFilterTree extends IFilter {
    tree: {id: string; label?: SystemTranslation | null};
}

// on library's tree
export interface IFilterLibrary extends IFilter {
    library: {id: string; label?: SystemTranslation | null};
    parentAttribute: IAttribute;
}

export enum SidebarContentType {
    filters = 'filters',
    view = 'view',
    versions = 'versions'
}

export enum SearchMode {
    search = 'search',
    select = 'select'
}

export interface ITableCell {
    value: any;
    type: AttributeType;
    format?: AttributeFormat;
}

export interface ITableRow {
    record: IRecordIdentityWhoAmI;
    [x: string]: ITableCell | IRecordIdentityWhoAmI | string;
}

export interface IFilterAttribute extends IFilter {
    attribute: IAttribute; // Put the attribute in the filter to avoid having to fetch them multiple times
    parentTreeLibrary?: IFilterLibrary; // on tree library attribute
}

export interface IFilterTree extends IFilter {
    tree: {id: string; label?: SystemTranslation | null};
}

// on library's tree
export interface IFilterLibrary extends IFilter {
    library: {id: string; label?: SystemTranslation | null};
    parentAttribute: IAttribute;
}

export interface ISelectedRecord {
    id: string;
    label: string;
    library: string;
}

export interface ISearchSelection {
    selected: ISelectedRecord[];
    allSelected: boolean;
}

export interface ISelectionMenuAction {
    key: string;
    icon: ReactNode;
    title: string;
    onClick: (selection: ISearchSelection, filters?: IFilter[]) => void;
}
