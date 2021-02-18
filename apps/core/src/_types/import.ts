// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReadStream} from 'fs-capacitor';
import {IValueMetadata, IValueVersion} from './value';

export enum Action {
    ADD = 'add',
    REPLACE = 'replace',
    UPDATE = 'update',
    REMOVE = 'remove'
}

export interface IMatch {
    attribute: string;
    value: string;
}

export interface IValue {
    value: string | IMatch[];
    metadata?: IValueMetadata;
    version?: IValueVersion;
}

export interface IData {
    attribute: string;
    values: IValue[];
    action: Action;
}

export interface IElement {
    library: string;
    matches: IMatch[];
    data: IData[];
    links: IData[];
}

export interface ITree {
    library: string;
    treeId: string;
    matches: IMatch[];
    parent?: {
        library: string;
        matches: IMatch[];
    };
    action: Action;
    order?: number;
}
export interface IFile {
    elements: IElement[];
    trees: ITree[];
}

export interface IFileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => ReadStream;
}
