import {useMemo} from 'react';
import {useMeasure} from '@uidotdev/usehooks';

const headerTableHeight = 32;
const paginationHeight = 48;

// Note: Logic copied from libs/ui/src/components/Explorer/useTableScrollableHeight.ts
export const useTableScrollableHeight = (withPagination: boolean) => {
    const [containerRef, {height}] = useMeasure();

    const scrollHeight = useMemo(
        () => (height === null ? '100vh' : `${height - headerTableHeight - (withPagination ? paginationHeight : 0)}px`),
        [withPagination, height],
    );

    return {containerRef, scrollHeight};
};
