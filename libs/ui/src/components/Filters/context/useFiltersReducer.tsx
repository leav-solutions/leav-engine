import {useEffect, useMemo, useReducer, useState} from 'react';
import {filtersReducer} from './filtersReducer';
import {filtersInitialState} from './filtersInitialState';
import {type AttributesById, useTransformFilters} from '../useTransformFilters';
import {type GetViewsListQuery, useExplorerAttributesQuery, useGetViewsListQuery} from '_ui/_gqlTypes';
import {type FiltersOperator, type UIFilter} from '../_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useGetTreeFilters} from './useGetTreeFilters';

export interface IFiltersProviderProps {
    libraryId: string | null;
    viewId?: string;
    filters?: UIFilter[];
    filtersOperator?: FiltersOperator;
    ignoreViewByDefault?: boolean;
    pinFilters?: boolean;
    skip: boolean;
}

type ViewListItem = GetViewsListQuery['views']['list'][number];

const _selectUserView = (viewList: ViewListItem[], viewId?: string): ViewListItem | null =>
    (viewId && viewList.find(v => v.id === viewId)) || viewList.at(-1) || null;

export const useFiltersReducer = ({
    libraryId,
    viewId,
    filters,
    filtersOperator = 'AND',
    ignoreViewByDefault = false,
    skip,
}: IFiltersProviderProps) => {
    const {t} = useSharedTranslation();
    const [refetchViews, setRefetchViews] = useState(false);
    const [filtersData, dispatch] = useReducer(filtersReducer(setRefetchViews), {
        ...filtersInitialState,
        filtersOperator: filtersOperator ?? filtersInitialState.filtersOperator,
    });
    const {toValidFilters, toUIFilters} = useTransformFilters();

    const needToReload = refetchViews || (libraryId && libraryId !== filtersData.libraryId);

    const {data: viewData, loading: viewsLoading} = useGetViewsListQuery({
        skip: skip || (libraryId === null && !needToReload),
        variables: {libraryId: libraryId as string},
    });

    const {data: treeFilters, loading: treeFiltersLoading} = useGetTreeFilters({libraryId, skip});

    const userView = _selectUserView(viewData?.views?.list ?? [], viewId);

    const allFilters = useMemo(() => {
        const defaultFilters = toValidFilters(filters ?? []);
        const viewFilters = ignoreViewByDefault ? [] : toValidFilters(userView?.filters ?? []);
        return defaultFilters.concat(viewFilters);
    }, [filters, userView, ignoreViewByDefault]);

    const attributesToGet = useMemo(() => allFilters.map(f => f.field), [allFilters]);

    const {data: attributesData, loading: attributesLoading} = useExplorerAttributesQuery({
        variables: {ids: attributesToGet},
        skip: libraryId === null || viewsLoading || attributesToGet.length === 0,
    });

    const attributesDataById = useMemo(
        () =>
            (attributesData?.attributes?.list ?? []).reduce<AttributesById>((acc, attr) => {
                if (attr.permissions.access_attribute) {
                    acc[attr.id] = attr;
                }
                return acc;
            }, {}),
        [attributesData],
    );

    useEffect(() => {
        if (!viewsLoading && !treeFiltersLoading) {
            setRefetchViews(false);
            const uiFilters = toUIFilters({filters: allFilters, treeFilters, attributesDataById, t});
            dispatch({
                type: 'RESET',
                payload: {
                    libraryId,
                    viewId,
                    filtersOperator: filtersOperator ?? filtersInitialState.filtersOperator,
                    filters: uiFilters,
                    initialFilters: uiFilters,
                    attributesDataById,
                    loading: viewsLoading || attributesLoading,
                },
            });
        }
    }, [attributesDataById, viewsLoading, treeFiltersLoading]);

    return {filtersData, dispatch};
};
