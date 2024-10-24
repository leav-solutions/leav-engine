// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExplorerQuery} from '_ui/_gqlTypes';
import {ReactNode} from 'react';

export type DataGroupedFilteredSorted<Field extends keyof ExplorerQuery['records']['list'][number]> = Array<{
    libraryId: string;
    itemId: string;
    value: Required<ExplorerQuery['records']['list'][number][Field]>;
}>;

export type ItemActions<T> = Array<{
    callback: (item: T) => void;
    icon: ReactNode;
    label: string;
}>;
