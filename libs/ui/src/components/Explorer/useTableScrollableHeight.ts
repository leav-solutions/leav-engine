// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo} from 'react';
import {useMeasure} from '@uidotdev/usehooks';

const headerTableHeight = 56;
export const defaultPaginationHeight = 56;

export const useTableScrollableHeight = (withPagination: boolean) => {
    const [containerRef, {height}] = useMeasure();

    const scrollHeight = useMemo(
        () =>
            height === null
                ? '100vh'
                : `${height - headerTableHeight - (withPagination ? defaultPaginationHeight : 0)}px`,
        [withPagination, height]
    );

    return {containerRef, scrollHeight};
};
