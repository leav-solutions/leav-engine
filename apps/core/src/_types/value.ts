// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, Override} from '@leav/utils';
import {IDbEdge} from 'infra/db/_types';
import {IRecord} from './record';
import {ITreeNode, TreePaths} from './tree';
import {EMPTY_VALUE} from 'infra/value/valueRepo';

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

export interface IGenericValue {
    id_value?: string;
    attribute?: string;
    created_at?: number;
    modified_at?: number;
    created_by?: string;
    modified_by?: string;
    version?: IValueVersion;
    metadata?: IValueMetadata;
    isInherited?: boolean;
    isCalculated?: boolean;
}

export interface IStandardValue extends IGenericValue {
    payload?: any | EmptyValue;
    raw_payload?: any | EmptyValue;
}

export interface ILinkValue extends IGenericValue {
    payload?: IRecord;
}

export interface ITreeValue extends IGenericValue {
    payload?: ITreeNode;
    treeId: string;
}

export type IValue = IStandardValue | ILinkValue | ITreeValue;

export interface IDateRangeValue<T = string | number> {
    from: T;
    to: T;
}

export interface IValuesOptions {
    version?: IValueVersion;
    forceArray?: boolean;
    forceGetAllValues?: boolean;
    [optionName: string]: any;
}

export interface IFindValueTree {
    name: string;
    currentIndex: number;
    elements: TreePaths;
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
