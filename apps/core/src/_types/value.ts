// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeElement, ITreeNode, TreePaths} from './tree';

export interface IValueVersion {
    [treeName: string]: ITreeElement;
}

export interface IDbValueVersion {
    [treeName: string]: string;
}

export interface IValueMetadata {
    [fieldName: string]: any;
}

export interface IValue {
    id_value?: string;
    attribute?: string;
    value?: any;
    raw_value?: any;
    created_at?: number;
    modified_at?: number;
    version?: IValueVersion;
    metadata?: IValueMetadata;
}

export interface IValuesOptions {
    version?: IValueVersion;
    forceArray?: boolean;
    forceGetAllValues?: boolean;
    [optionName: string]: any;
}

export interface IFindValueTree {
    name: string;
    branchIndex: number;
    elementIndex: number;
    elements: TreePaths;
}
