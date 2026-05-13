import {type ReactNode} from 'react';
import {type IRecordIdentity} from './records';

export interface ITreeNode {
    title: string | ReactNode;
    id: string;
    key: string | null;
    children: ITreeNode[];
    disabled?: boolean;
}

export interface ITreeNodeWithRecord extends ITreeNode {
    record: IRecordIdentity;
    children: ITreeNodeWithRecord[];
}

export interface INavigationPath {
    id: string;
    library: string;
    label?: string | null;
}
