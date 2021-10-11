// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {RecordFilterCondition, RecordFilterOperator, TreeElementInput, ViewTypes} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
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

export type IPreview = {
    small: string;
    medium: string;
    big: string;
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
    key: string; // attribute / tree key
    value: {value: boolean | string | number | null; label?: string};
    active: boolean;
    condition: RecordFilterCondition;
    attribute?: IAttribute; // Put the attribute in the filter to avoid having to fetch him multiple times
    tree?: ITree;
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
    AND = 'AND',
    OR = 'OR',
    OPEN_BRACKET = 'OPEN_BRACKET',
    CLOSE_BRACKET = 'CLOSE_BRACKET'
}

export enum TreeConditionFilter {
    CLASSIFIED_IN = 'CLASSIFIED_IN',
    NOT_CLASSIFIED_IN = 'NOT_CLASSIFIED_IN'
}

export enum AttributeConditionFilter {
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
    treeId?: string;
}

export enum OrderSearch {
    DESC = 'DESC',
    ASC = 'ASC'
}

export enum DisplaySize {
    small = 'small',
    medium = 'medium',
    big = 'big'
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
    label: ISystemTranslation;
    libraries: Array<{
        library: {
            id: string;
            label: ISystemTranslation;
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
    library?: string;
    label: ISystemTranslation;
    type: ViewTypes;
    owner: boolean;
    shared: boolean;
    description?: ISystemTranslation;
    color?: string;
    filters?: IFilter[];
    settings?: IGetViewListSettings[];
    sort?: IGetViewListSort;
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

export interface ITableCell {
    value: any;
    type?: AttributeType;
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

export enum WorkspacePanels {
    HOME = 'home',
    LIBRARY = 'library',
    TREE = 'tree'
}
