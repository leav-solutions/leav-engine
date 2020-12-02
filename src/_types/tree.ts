// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecord} from './record';
import {ISystemTranslation} from './systemTranslation';

export interface ITree {
    id: string;
    libraries: string[];
    behavior?: TreeBehavior;
    label: ISystemTranslation;
    system?: boolean;
}

export interface ITreeFilterOptions {
    id?: string;
    label?: string;
    system?: boolean;
}

export interface ITreeElement {
    id: string;
    library: string;
}

export interface ITreeNode {
    order?: number;
    record?: IRecord;
    parent?: ITreeNode[];
    ancestors?: ITreeNode[];
    children?: ITreeNode[];
    linkedRecords?: IRecord[];
}

export enum TreeBehavior {
    STANDARD = 'standard',
    FILES = 'files'
}
