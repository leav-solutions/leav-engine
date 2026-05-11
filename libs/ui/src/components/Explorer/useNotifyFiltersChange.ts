// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useRef} from 'react';
import {type FiltersChangePayload} from './_types';

/**
 * Notifies the parent when filters change from inside the Explorer (FilterToolBar).
 *
 * Skips the first emission after `isLoading` becomes false: at that moment
 * `filters` reflects the initial view, not a user change. Without this guard,
 * a viewConfig panel listening on `onFiltersChange` would mark the view as
 * `viewModified: true` on mount.
 */
export const useNotifyFiltersChange = ({
    isLoading,
    filters,
    filtersOperator,
    onFiltersChange,
}: {
    isLoading: boolean;
    filters: FiltersChangePayload['filters'];
    filtersOperator: FiltersChangePayload['filtersOperator'];
    onFiltersChange: ((payload: FiltersChangePayload) => void) | undefined;
}) => {
    const hasEmittedInitialRef = useRef(false);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        if (!hasEmittedInitialRef.current) {
            hasEmittedInitialRef.current = true;
            return;
        }
        onFiltersChange?.({filters, filtersOperator});
    }, [isLoading, filters, filtersOperator, onFiltersChange]);
};
