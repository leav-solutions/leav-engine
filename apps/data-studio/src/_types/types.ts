// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute_embedded_fields} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {type AttributeFormat, type AttributeType, RecordFilterCondition} from '_gqlTypes';
import {type RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    type ILibraryDetailExtendedAttributeParentLinkedLibrary,
    type ILibraryDetailExtendedAttributeParentLinkedTree,
} from '../graphQL/queries/libraries/getLibraryDetailExtendQuery';

export interface ISystemTranslation {
    [lang: string]: string;
}

export interface ILibrary {
    id: string;
    label: ISystemTranslation;
}

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

export enum PreviewSize {
    TINY = 'tiny',
    SMALL = 'small',
    MEDIUM = 'medium',
    BIG = 'big',
}

export enum AvailableLanguage {
    EN = 'en',
    FR = 'fr',
}

export enum FilterType {
    ATTRIBUTE = 'ATTRIBUTE',
    TREE = 'TREE',
    LIBRARY = 'LIBRARY',
}

export interface IFilter {
    type: FilterType;
    index: number; // use to sort the filters
    key: string; // attribute / tree key
    value: {value: boolean | string | number | null | IDateRangeValue; label?: string};
    active: boolean;
    condition: AttributeConditionType | TreeConditionFilter | ThroughConditionFilter;
}

export enum OperatorFilter {
    AND = 'AND',
    OR = 'OR',
    OPEN_BRACKET = 'OPEN_BRACKET',
    CLOSE_BRACKET = 'CLOSE_BRACKET',
}

export enum TreeConditionFilter {
    CLASSIFIED_IN = 'CLASSIFIED_IN',
    NOT_CLASSIFIED_IN = 'NOT_CLASSIFIED_IN',
}

export enum ThroughConditionFilter {
    THROUGH = 'THROUGH',
}

// We're exporting a const and not an enum to "merge" the enum coming
// from Graphql types with some condition of our own
export const AttributeConditionFilter = {
    ...RecordFilterCondition,
    ...ThroughConditionFilter,
};

export type AttributeConditionType = ValueOf<typeof AttributeConditionFilter>;

export enum OrderSearch {
    DESC = 'DESC',
    ASC = 'ASC',
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

export interface IParentAttributeData {
    id: string;
    type: AttributeType;
}

export interface ITreeData {
    treeAttributeId: string;
    libraryTypeName: string;
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

export enum InfoType {
    BASIC = 'basic',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

export enum InfoPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export enum InfoChannel {
    TRIGGER = 'trigger',
    PASSIVE = 'passive',
}

export interface IBaseInfo {
    content: string;
    type: InfoType;
}

export interface IInfo extends IBaseInfo {
    time?: number;
    priority?: InfoPriority;
    channel?: InfoChannel;
}

export interface ISharedStateSelectionSearch {
    type: SharedStateSelectionType.SEARCH;
    selected: ISharedSelected[];
    filters?: IFilter[];
    allSelected?: boolean;
}

export interface ISharedStateSelectionNavigation {
    type: SharedStateSelectionType.NAVIGATION;
    selected: ISharedSelected[];
    parent: string;
}

export type SharedStateSelection = ISharedStateSelectionSearch | ISharedStateSelectionNavigation;

export enum SharedStateSelectionType {
    NAVIGATION,
    SEARCH,
}

export interface ISharedSelected {
    id: string;
    library: string;
    label: string;
    nodeId?: string;
}

export enum WorkspacePanels {
    HOME = 'home',
    LIBRARY = 'library',
    TREE = 'tree',
}
export interface IDateRangeValue {
    from: string;
    to: string;
}

export type ValueOf<T> = T[keyof T];

export interface IApplicationSettings {
    libraries?: 'all' | 'none' | string[];
    librariesOrder?: string[];
    trees?: 'all' | 'none' | string[];
    treesOrder?: string[];
    showTransparency?: boolean;
}

export enum NotifTypes {
    TASK = 'TASK',
}
