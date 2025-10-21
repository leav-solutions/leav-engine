// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type Key} from 'react';
import {type KitTree} from 'aristid-ds';
import {type ITreeNodeWithRecord} from '_ui/types';

export interface ITreeMapElement extends ITreeNodeWithRecord {
    isLeaf?: boolean;
    paginationOffset: number;
    children: ITreeMapElement[];
    parents?: string[];
    isShowMore?: boolean;
    selectable?: boolean;
    disabled?: boolean;
}

export interface ITreeMap {
    [nodeId: string]: ITreeMapElement;
}

type OnCheckFirstParam = Parameters<ComponentProps<typeof KitTree>['onCheck']>[0];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const _isObjectSelection = (selection: OnCheckFirstParam): selection is Exclude<OnCheckFirstParam, Key[]> =>
    'checked' in selection && 'halfChecked' in selection;
