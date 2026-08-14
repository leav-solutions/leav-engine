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

    const {
        /**
         * List of my views and shared views
         */
        data: viewData,
        loading: viewsLoading,
    } = useGetViewsListQuery({
        skip: skip || (libraryId === null && !needToReload),
        variables: {
            libraryId: libraryId as string,
        },
    });

    const {data: treeFilters, loading: treeFiltersLoading} = useGetTreeFilters({libraryId, skip});

    let userView: GetViewsListQuery['views']['list'][number] | undefined;
    if (viewId) {
        userView = viewData?.views?.list?.find(viewItem => viewItem.id === viewId);
    }
    userView = userView ?? viewData?.views?.list?.at(-1) ?? null;

    const userViewFilters = ignoreViewByDefault ? [] : toValidFilters(userView?.filters ?? []);

    const preparedDefaultFilters = toValidFilters(filters ?? []);
    const allFilters = preparedDefaultFilters.concat(userViewFilters);

    const attributesToGet = allFilters.map(filter => filter.field);

    const {data: attributesData, loading: attributesLoading} = useExplorerAttributesQuery({
        variables: {
            ids: attributesToGet,
        },
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
        if (!viewsLoading && !treeFiltersLoading && !attributesLoading) {
            setRefetchViews(false);
            const uiFilters = toUIFilters({filters: allFilters ?? [], treeFilters, attributesDataById, t});
            dispatch({
                type: 'RESET',
                payload: {
                    libraryId,
                    viewId,
                    filtersOperator: filtersOperator ?? filtersInitialState.filtersOperator,
                    filters: uiFilters,
                    initialFilters: uiFilters,
                    attributesDataById,
                    loading: false,
                },
            });
        }
    }, [attributesDataById, viewsLoading, treeFiltersLoading, attributesLoading]);

    return {filtersData, dispatch};
};
