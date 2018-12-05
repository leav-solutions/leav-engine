import {IRecord} from './record';
import {ISystemTranslation} from './systemTranslation';

export interface ITree {
    id: string;
    libraries: string[];
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
