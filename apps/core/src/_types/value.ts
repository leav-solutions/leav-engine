// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive} from '@leav/utils';
import {IDbEdge} from 'infra/db/_types';
import {IRecord} from './record';
import {ITreeNode, TreePaths} from './tree';

export interface IValueVersion {
    [treeName: string]: string;
}

export interface IDbValueVersion {
    [treeName: string]: string;
}

export interface IValueMetadata {
    [fieldName: string]: IStandardValue | AnyPrimitive;
}

export interface IGenericValue {
    id_value?: string;
    attribute?: string;
    created_at?: number;
    modified_at?: number;
    created_by?: string;
    modified_by?: string;
    version?: IValueVersion;
    metadata?: IValueMetadata;
}

export interface IStandardValue extends IGenericValue {
    value?: any;
    raw_value?: string;
}

export interface ILinkValue extends IGenericValue {
    value?: IRecord;
}

export interface ITreeValue extends IGenericValue {
    value?: ITreeNode;
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
