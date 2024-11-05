// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReactNode} from 'react';
import {IRecordIdentity} from './records';

export interface ITreeNode {
    title: string | ReactNode;
    id: string;
    key: string | null;
    children: ITreeNode[];
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
