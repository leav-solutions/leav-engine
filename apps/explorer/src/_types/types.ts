// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {RecordFilterCondition, RecordFilterOperator, TreeElementInput, ViewTypes} from '_gqlTypes/globalTypes';
import {
    ILibraryDetailExtendedAttributeParentLinkedLibrary,
    ILibraryDetailExtendedAttributeParentLinkedTree
} from '../graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {IGetViewListSort} from '../graphQL/queries/views/getViewsListQuery';

export interface ILabel {
    [x: string]: string;
}

export interface ILibrary {
    id: string;
    label: ILabel;
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

export type IPreview = {
    small: string;
    medium: string;
    big: string;
    pages: string;
} | null;

export interface IItemWhoAmI {
    id: string;
    label?: string;
    preview?: IPreview;
    color?: string;
    library?: {
        id: string;
        label: ILabel;
    };
}

export interface IItemBase {
    fields: {[x: string]: any};
    whoAmI: IItemWhoAmI;
    index: number;
}

export type IItem = IItemBase;

export interface IRecordIdentityWhoAmI {
    [x: string]: any;
    id: string;
    label?: string;
    preview?: IPreview;
    color?: string;
    library?: {
        id: string;
        label: ILabel;
    };
    index?: number;
}

export enum PreviewAttributes {
    small = 'small',
    medium = 'medium',
    big = 'big',
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

export interface IFilter {
    index: number; // use to sort the filters
    key: string; // attribute key
    value: unknown;
    active: boolean;
    condition: ConditionFilter | RecordFilterCondition;
    attribute: IAttribute; // Put the attribute in the filter to avoid having to fetch him multiple times
}

export enum FilterOperator {
    AND = 'AND',
    OR = 'OR'
}

export enum AttributeFormat {
    text = 'text',
    numeric = 'numeric',
    date = 'date',
    encrypted = 'encrypted',
    boolean = 'boolean',
    extended = 'extended'
}

export enum AttributeType {
    simple = 'simple',
    simple_link = 'simple_link',
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    tree = 'tree'
}

export enum OperatorFilter {
    and = 'AND',
    or = 'OR',
    openParent = 'OPEN_BRACKET',
    closeParent = 'CLOSE_BRACKET'
}

export enum ConditionFilter {
    CONTAINS = 'CONTAINS',
    NOT_CONTAINS = 'NOT_CONTAINS',
    EQUAL = 'EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    BEGIN_WITH = 'BEGIN_WITH',
    END_WITH = 'END_WITH',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN'
}

export interface IQueryFilter {
    field?: string;
    value?: string;
    condition?: RecordFilterCondition;
    operator?: RecordFilterOperator;
}

export enum OrderSearch {
    desc = 'desc',
    asc = 'asc'
}

export enum DisplaySize {
    small = 'listSmall',
    medium = 'listMedium',
    big = 'listBig'
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
    parentAttributeData?: IParentAttributeData;
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
    label: ILabel;
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
    label: ILabel;
    libraries: Array<{
        library: {
            id: string;
            label: ILabel;
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
    passive = 'passive'
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
    label: string;
    type: ViewTypes;
    color?: string;
    shared: boolean;
    description?: string;
    fields?: string[];
    filters?: IQueryFilter[];
    sort: IGetViewListSort;
}

export enum ViewType {
    list = 'list',
    cards = 'cards',
    timeline = 'timeline'
}

export interface ILinkedElement {
    id: string;
    linkedType: LinkedType;
}

export interface ITableItem {
    value: any;
    type?: AttributeType;
    id: string;
    library: string;
    label: string;
}
export interface ITableItems {
    [x: string]: ITableItem;
}

export interface ISharedStateSelectionSearch {
    type: SharedStateSelectionType.search;
    selected: ISharedSelected[];
    allSelected?: boolean;
}

export interface ISharedStateSelectionNavigation {
    type: SharedStateSelectionType.navigation;
    selected: ISharedSelected[];
    parent: TreeElementInput;
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
}

export interface IToggleSelection {
    selectionType: SharedStateSelectionType;
    elementSelected: ISharedSelected;
    parent?: TreeElementInput;
}
