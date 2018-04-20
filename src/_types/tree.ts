import {ISystemTranslation} from './systemTranslation';
import {IRecord} from './record';

export interface ITree {
    id: string;
    libraries: string[];
    label: ISystemTranslation;
    system?: boolean;
}

export interface ITreeFilterOptions {
    id?: string;
}

export interface ITreeElement {
    id: number;
    library: string;
}

export interface ITreeNode {
    record?: IRecord;
    children?: ITreeNode[];
}
