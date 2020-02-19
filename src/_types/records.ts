import {MutableRefObject} from 'react';
import {RecordIdentity_whoAmI} from '../_gqlTypes/RecordIdentity';

// Using type intersection to be able to define properties ID and whoAmI and allow dynamic keys
// with type IValue
export type RecordData = {
    [attributeName: string]: IGenericValue | IGenericValue[];
} & {
    id?: string;
    whoAmI?: RecordIdentity_whoAmI;
};

interface ILinkElement {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
}

export interface ITreeLinkNode {
    record: {
        whoAmI: RecordIdentity_whoAmI;
    };
}

export interface ITreeLinkElement extends ITreeLinkNode {
    ancestors: ITreeLinkNode[] | null;
}

export interface IGenericValue {
    id_value: string | null;
    value: string | ILinkElement | ITreeLinkElement | null;
    raw_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: IValueVersion | null;
}

export interface IValue extends IGenericValue {
    value: string | null;
}

export interface ILinkValue extends IGenericValue {
    value: ILinkElement | null;
}

export interface ITreeLinkValue extends IGenericValue {
    value: ITreeLinkElement | null;
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
