import {useMemo} from 'react';
import {useMeasure} from '@uidotdev/usehooks';

const headerTableHeight = 48;
export const defaultPaginationHeight = 56;

export const useTableScrollableHeight = (withPagination: boolean) => {
    const [containerRef, {height}] = useMeasure();

    const scrollHeight = useMemo(
        () =>
            height === null
                ? '100vh'
                : `${height - headerTableHeight - (withPagination ? defaultPaginationHeight : 0)}px`,
        [withPagination, height],
    );

    return {containerRef, scrollHeight};
};
