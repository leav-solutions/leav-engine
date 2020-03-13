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
    id: number;
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
