// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MutableRefObject} from 'react';
import {RecordIdentity_whoAmI} from '../_gqlTypes/RecordIdentity';

// Using type intersection to be able to define properties ID and whoAmI and allow dynamic keys
// with type IValue
export type RecordData = {
    [attributeName: string]: IGenericValue[];
} & {
    id?: string;
    whoAmI?: RecordIdentity_whoAmI;
};

interface ILinkElement {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
}

export interface ITreeLinkNode {
    id: string;
    record: {
        whoAmI: RecordIdentity_whoAmI;
    };
}

export interface ITreeLinkElement extends ITreeLinkNode {
    ancestors: ITreeLinkNode[];
}

export interface IGenericValue {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: IValueVersion | null;
}

export interface IValue extends IGenericValue {
    value: string | number | boolean | null;
    raw_value: string | number | boolean | null;
}

export interface ILinkValue extends IGenericValue {
    linkValue: ILinkElement | null;
}

export interface ITreeLinkValue extends IGenericValue {
    treeValue: ITreeLinkElement | null;
}

export type FormLinksAllowedValues = ILinkValue | ITreeLinkValue;

export interface ITreeElement {
    library: string;
    id: number;
}

export interface IGetRecordData {
    record: {
        list: RecordData[];
    };
}

export interface IValueVersion {
    [versionName: string]: ITreeElement;
}

export declare namespace RecordEdition {
    type SubmitFunc = () => void;
    type FuncRef = MutableRefObject<SubmitFunc | null>;
    type SetSubmitFuncRef = (ref: FuncRef) => void | null;
}
