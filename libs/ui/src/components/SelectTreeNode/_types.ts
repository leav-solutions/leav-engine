// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, Key} from 'react';
import {KitTree} from 'aristid-ds';
import {ITreeNodeWithRecord} from '_ui/types';

export interface ITreeMapElement extends ITreeNodeWithRecord {
    isLeaf?: boolean;
    paginationOffset: number;
    children: ITreeMapElement[];
    isShowMore?: boolean;
    selectable?: boolean;
    disabled?: boolean;
}

export interface ITreeMap {
    [nodeId: string]: ITreeMapElement;
}

type OnCheckFirstParam = Parameters<ComponentProps<typeof KitTree>['onCheck']>[0];

export const _isObjectSelection = (selection: OnCheckFirstParam): selection is Exclude<OnCheckFirstParam, Key[]> =>
    'checked' in selection && 'halfChecked' in selection;
