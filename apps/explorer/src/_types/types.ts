// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    AttributeFormat,
    AttributeType,
    RecordFilterCondition,
    RecordFilterOperator,
    ViewSizes,
    ViewTypes
} from '_gqlTypes/globalTypes';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {TREE_NODE_CHILDREN_treeNodeChildren_list_permissions} from '_gqlTypes/TREE_NODE_CHILDREN';
import {
    ILibraryDetailExtendedAttributeParentLinkedLibrary,
    ILibraryDetailExtendedAttributeParentLinkedTree
} from '../graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {IGetViewListSettings, IGetViewListSort} from '../graphQL/queries/views/getViewsListQuery';

export interface ISystemTranslation {
    [lang: string]: string;
}

export interface ILibrary {
    id: string;
    label: ISystemTranslation;
    gqlNames: {
        query: string;
        filter: string;
        searchableFields: string;
    };
}

export enum LinkedType {
    library = 'library',
    tree = 'tree'
}

export type FilePreview = {
    tiny: string;
    small: string;
    medium: string;
    big: string;
    huge: string;
    pages: string;
} | null;

export interface IItemBase {
    fields: {[x: string]: any};
    whoAmI: RecordIdentity_whoAmI;
    index: number;
}

export type IItem = IItemBase;

export interface IRecordIdentityWhoAmI extends RecordIdentity_whoAmI {
    [x: string]: any;
    index?: number;
}

export enum PreviewAttributes {
    tiny = 'tiny',
    small = 'small',
    medium = 'medium',
    big = 'big',
    huge = 'huge',
    pages = 'pages'
}

export enum PreviewSize {
    small = 'small',
    medium = 'medium',
    big = 'big'
}

export enum AvailableLanguage {
    en = 'en',
    fr = 'fr'
}

export enum FilterTypes {
    filter = 'filter',
    separator = 'separator'
}

export interface IFilterSeparatorCommon {
    key: number;
    id: string;
}

export enum FilterType {
    ATTRIBUTE = 'ATTRIBUTE',
    TREE = 'TREE',
    LIBRARY = 'LIBRARY'
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
    tree: {id: string; label?: ISystemTranslation | null};
}

// on library's tree
export interface IFilterLibrary extends IFilter {
    library: {id: string; label?: ISystemTranslation | null};
    parentAttribute: IAttribute;
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

export interface IQueryFilter {
    field?: string;
    value?: string;
    condition?: RecordFilterCondition;
    operator?: RecordFilterOperator;
    treeId?: string;
}

export enum OrderSearch {
    DESC = 'DESC',
    ASC = 'ASC'
}

export interface IAttribute {
    id: string;
    library: string;
    type: AttributeType;
    format?: AttributeFormat;
    label: SystemTranslation | null;
    isLink: boolean;
    isMultiple: boolean;
    linkedLibrary?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linkedTree?: ILibraryDetailExtendedAttributeParentLinkedTree;
    parentAttribute?: IAttribute;
    embedded_fields?: Array<GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields | null> | null;
}

export type ExtendFormat = string | {[key: string]: ExtendFormat[]};

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

export interface IRecordEdition {
    show: boolean;
    item?: IItem;
}

export interface IAccordionActive {
    id: string;
    library: string;
    depth: number;
}

export interface ISelectedAttribute {
    id: string;
    library: string;
    path: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format?: AttributeFormat | null;
    multiple_values: boolean;
    parentAttributeData?: IParentAttributeData;
    embeddedFieldData?: IEmbeddedFields;
    treeData?: ITreeData;
}

export interface IParentAttributeData {
    id: string;
    type: AttributeType;
}

export interface ITreeData {
    treeAttributeId: string;
    libraryTypeName: string;
}

export interface IEmbeddedFields {
    id: string;
    format: AttributeFormat;
    label: ISystemTranslation;
    embedded_fields: IEmbeddedFields[];
}

export interface IGroupEmbeddedFields {
    [attributeId: string]: {
        embedded_fields: {[key: string]: IEmbeddedFields};
    };
}

export interface IAttributeSelected {
    id: string;
    library: string;
    originAttributeData?: IParentAttributeData;
    extendedData?: IEmbeddedFieldData;
    treeData?: ITreeData;
}

export interface ITree {
    id: string;
    label: ISystemTranslation | null;
    libraries: Array<{
        library: {
            id: string;
            label: ISystemTranslation | null;
        };
    }>;
}

export interface INavigationPath {
    id: string;
    library: string;
    label?: string | null;
}

export enum NotificationType {
    basic = 'basic',
    success = 'success',
    warning = 'warning',
    error = 'error'
}

export enum NotificationPriority {
    low = 'low',
    medium = 'medium',
    high = 'high'
}

export enum NotificationChannel {
    trigger = 'trigger',
    serverError = 'passive'
}

export interface IBaseNotification {
    content: string;
    type: NotificationType;
}

export interface INotification extends IBaseNotification {
    time?: number;
    priority?: NotificationPriority;
    channel?: NotificationChannel;
}

export type ILang = string[];

export enum TypeSideItem {
    filters = 'filters',
    view = 'view'
}

export interface IView {
    id: string;
    library?: string;
    label: ISystemTranslation;
    display: IViewDisplay;
    owner: boolean;
    shared: boolean;
    description?: ISystemTranslation;
    color?: string;
    filters?: IFilter[];
    settings?: IGetViewListSettings[];
    sort?: IGetViewListSort;
}

export interface IViewDisplay {
    type: ViewTypes;
    size: ViewSizes;
}

export interface ILinkedElement {
    id: string;
    linkedType: LinkedType;
}

export interface ITableCell {
    value: any;
    type: AttributeType;
    format?: AttributeFormat;
}

export interface ITableRow {
    record: RecordIdentity_whoAmI;
    [x: string]: ITableCell | IRecordIdentityWhoAmI | string;
}

export interface ISharedStateSelectionSearch {
    type: SharedStateSelectionType.search;
    selected: ISharedSelected[];
    allSelected?: boolean;
}

export interface ISharedStateSelectionNavigation {
    type: SharedStateSelectionType.navigation;
    selected: ISharedSelected[];
    parent: string;
}

export type SharedStateSelection = ISharedStateSelectionSearch | ISharedStateSelectionNavigation;

export enum SharedStateSelectionType {
    navigation,
    search
}

export interface ISharedSelected {
    id: string;
    library: string;
    label: string;
    nodeId?: string;
}

export interface IToggleSelection {
    selectionType: SharedStateSelectionType;
    elementSelected: ISharedSelected;
    parent?: string;
}

export enum WorkspacePanels {
    HOME = 'home',
    LIBRARY = 'library',
    TREE = 'tree'
}
export interface IDateRangeValue {
    from: string;
    to: string;
}

export type ValueOf<T> = T[keyof T];

export interface IPermissions {
    [key: string]: boolean;
}

export interface ITreeContentRecordAndChildren {
    id: string;
    record: RecordIdentity;
    children?: ITreeContentRecordAndChildren[];
    permissions: TREE_NODE_CHILDREN_treeNodeChildren_list_permissions;
}
