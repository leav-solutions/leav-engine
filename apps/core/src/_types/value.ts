// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AnyPrimitive, type Override} from '@leav/utils';
import {type IDbEdge} from 'infra/db/_types';
import {type IRecord} from './record';
import {type ITreeNode, type TreePath} from './tree';
import {type EMPTY_VALUE} from 'infra/value/valueRepo';
import {type AttributeTypes} from './attribute';

export type IValueFromGql = Override<
    Omit<IValue, 'version'>,
    {
        value: IValue['payload'];
        metadata: Array<{
            name: string;
            value: string;
        }>;
    }
>;

export interface IValueVersion {
    [treeName: string]: string;
}

export type IValueVersionFromGql = Array<{
    treeId: string;
    treeNodeId: string;
}>;

export type IValueFromGraphql = Override<
    IValue,
    {
        metadata: Array<{name: string; value: string}>;
    }
>;

export interface IDbValueVersion {
    [treeName: string]: string;
}

export interface IValueMetadata {
    [fieldName: string]: IStandardValue | AnyPrimitive;
}

export type EmptyValue = typeof EMPTY_VALUE;

interface ICommonGenericSaveValue {
    /**
     * The id of the edge for advanced, advanced link or tree values
     * In case of advanced reverse link from simple link, this is the id of the linked record
     */
    id_value?: string | null;
    attribute?: string;
    created_at?: number;
    modified_at?: number;
    created_by?: string;
    modified_by?: string;
    version?: IValueVersion;
    metadata?: IValueMetadata;
}

export interface IGenericValue extends ICommonGenericSaveValue {
    isInherited?: boolean;
    isCalculated?: boolean;
}

export interface IStandardBaseValue {
    /**
     * Computed value after get actions on attribute are done
     * TODO remove that any when possible
     * TODO remove optional when possible
     */
    payload?: any | EmptyValue;
    /**
     * Raw value from the database, before any computation
     * TODO, remove that any when possible
     */
    raw_payload?: any;
}

export interface ILinkBaseValue {
    /**
     * Linked record
     * TODO remove optional when possible
     */
    payload?: IRecord;
}

export interface ITreeBaseValue {
    /**
     * Linked tree node
     * TODO remove optional when possible
     */
    payload?: ITreeNode;
    treeId: string;
}

export interface IStandardValue extends IGenericValue, IStandardBaseValue {}

export interface ILinkValue extends IGenericValue, ILinkBaseValue {}

export interface ITreeValue extends IGenericValue, ITreeBaseValue {}

export type IBaseValue = IStandardBaseValue | ILinkBaseValue | ITreeBaseValue;

export type IValue = IStandardValue | ILinkValue | ITreeValue;

type IGenericSaveValue = ICommonGenericSaveValue;

export interface ISaveStandardValue extends IGenericSaveValue {
    /**
     * Any base type value to save
     */
    payload: number | string | boolean | EmptyValue | null;
}

export interface ISaveLinkValue extends IGenericSaveValue {
    /**
     * Record id to link
     */
    payload: string | null;
}

export interface ISaveTreeValue extends IGenericSaveValue {
    /**
     * Tree node id to link
     */
    payload: string | null;
}

export type ISaveValue = ISaveStandardValue | ISaveLinkValue | ISaveTreeValue;

export interface IDateRangeValue<T = string | number> {
    from: T;
    to: T;
}

export interface IValuesOptions {
    version?: IValueVersion;
    forceArray?: boolean;
    forceGetAllValues?: boolean;
    skipActions?: boolean;
    [optionName: string]: any;
}

export interface IFindValueTree {
    name: string;
    currentIndex: number;
    elements: TreePath;
}

export interface IValueEdge extends IDbEdge {
    attribute: string;
    modified_at: number;
    modified_by: string;
    created_at: number;
    created_by: string;
    version?: IDbValueVersion;
    metadata?: IValueMetadata;
}

export interface IValueByAttributeType {
    [AttributeTypes.SIMPLE]: IStandardValue;
    [AttributeTypes.SIMPLE_LINK]: ILinkValue;
    [AttributeTypes.ADVANCED]: IStandardValue;
    [AttributeTypes.ADVANCED_LINK]: ILinkValue;
    [AttributeTypes.TREE]: ITreeValue;
}

export interface ISaveValueByAttributeType {
    [AttributeTypes.SIMPLE]: ISaveStandardValue;
    [AttributeTypes.SIMPLE_LINK]: ISaveLinkValue;
    [AttributeTypes.ADVANCED]: ISaveStandardValue;
    [AttributeTypes.ADVANCED_LINK]: ISaveLinkValue;
    [AttributeTypes.TREE]: ISaveTreeValue;
}

export interface IBaseValueByAttributeType {
    [AttributeTypes.SIMPLE]: IStandardBaseValue;
    [AttributeTypes.SIMPLE_LINK]: ILinkBaseValue;
    [AttributeTypes.ADVANCED]: IStandardBaseValue;
    [AttributeTypes.ADVANCED_LINK]: ILinkBaseValue;
    [AttributeTypes.TREE]: ITreeBaseValue;
}

export type IValuesOccurrences<SimpleValueType extends IBaseValue = IBaseValue> = Array<{
    value: SimpleValueType['payload'] | null;
    count: number;
}>;
