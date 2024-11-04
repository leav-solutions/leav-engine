// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExplorerQuery} from '_ui/_gqlTypes';
import {ReactElement} from 'react';

export type DataGroupedFilteredSorted<Field extends keyof ExplorerQuery['records']['list'][number]> = Array<{
    libraryId: string;
    itemId: string;
    value: Required<ExplorerQuery['records']['list'][number][Field]>;
}>;

export type ItemActions<T> = Array<{
    callback: (item: T) => void;
    icon: ReactElement;
    label: string;
    isDanger?: boolean;
}>;

export type ActionHook<T = {}> = {isEnabled: boolean} & T;
