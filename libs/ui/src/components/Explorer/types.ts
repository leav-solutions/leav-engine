// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExplorerQuery} from '_ui/_gqlTypes';

export type IDataGroupedFilteredSorted<Field extends keyof ExplorerQuery['records']['list'][number]> = Array<{
    libraryId: string;
    itemId: string;
    value: Required<ExplorerQuery['records']['list'][number][Field]>;
}>;
