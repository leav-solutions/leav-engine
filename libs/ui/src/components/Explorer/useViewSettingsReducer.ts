// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useExplorerAttributesQuery, useGetViewsListQuery, ViewDetailsFilterFragment} from '_ui/_gqlTypes';
import {localizedTranslation, Override} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {useEffect, useMemo, useReducer} from 'react';
import {DefaultViewSettings, IExplorerFilter} from './_types';
import {v4 as uuid} from 'uuid';
import {viewSettingsReducer, viewSettingsInitialState, IViewSettingsState} from './manage-view-settings';
import {mapViewTypeFromLegacyToExplorer} from './_constants';

type ValidFieldFilter = Override<
    ViewDetailsFilterFragment,
    {
        field: NonNullable<ViewDetailsFilterFragment['field']>;
        condition: NonNullable<ViewDetailsFilterFragment['condition']>;
    }
>;

const _isValidFieldFilter = (filter: ViewDetailsFilterFragment): filter is ValidFieldFilter =>
    !!filter.field && !!filter.condition;

export const useViewSettingsReducer = (library: string, defaultViewSettings: DefaultViewSettings = {}) => {
    const {lang} = useLang();
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);

    const {
        data: viewData,
        loading: viewsLoading,
        error: viewError
    } = useGetViewsListQuery({
        variables: {
            libraryId: library
        }
    });

    // Take the last view from the array
    const userView = viewData?.views?.list?.at(-1);
    const userViewFilters: ValidFieldFilter[] =
        userView?.filters
            ?.filter(filter => _isValidFieldFilter(filter))
            .map(filter => ({
                field: filter.field,
                value: filter.value ?? null,
                condition: filter.condition
            })) ?? [];

    const attributesToHydrate = [
        ...new Set([
            ...(defaultViewSettings.filters?.map(filter => filter.field) ?? []),
            ...(defaultViewSettings.sort?.map(sort => sort.field) ?? []),
            ...userViewFilters.map(filter => String(filter.field)),
            ...(userView?.sort?.map(sort => sort.field) ?? [])
        ])
    ];

    const {
        data: attributesData,
        loading: attributesLoading,
        error: attributesError
    } = useExplorerAttributesQuery({
        variables: {
            ids: attributesToHydrate
        },
        skip: viewsLoading || !attributesToHydrate.length
    });

    const attributesDataById = useMemo(
        () =>
            (attributesData?.attributes?.list ?? []).reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {}),
        [attributesData]
    );

    const hydratedSettings = useMemo<IViewSettingsState>(
        () => ({
            ...viewSettingsInitialState,
            viewId: userView?.id,
            attributesIds: (userView?.attributes ?? []).map(attr => attr.id),
            viewType: userView?.display
                ? mapViewTypeFromLegacyToExplorer[userView.display.type]
                : viewSettingsInitialState.viewType,
            ...defaultViewSettings,
            sort: [...(defaultViewSettings?.sort ?? []), ...(userView?.sort ?? [])].map(s => ({
                field: s.field,
                order: s.order
            })),
            filters: [...(defaultViewSettings?.filters ?? []), ...userViewFilters].reduce<IExplorerFilter[]>(
                (acc, filter) => {
                    if (!attributesDataById[filter.field]) {
                        console.warn(
                            `Attribute ${filter.field} from defaultViewSettings or user view not found in database.`
                        );
                        return acc;
                    }

                    return [
                        ...acc,
                        {
                            ...filter,
                            value: filter.value ?? null,
                            id: uuid(),
                            attribute: {
                                label: localizedTranslation(attributesDataById[filter.field].label, lang),
                                format: attributesDataById[filter.field].format
                            }
                        }
                    ];
                },
                []
            )
        }),
        [defaultViewSettings, attributesDataById, userView, userViewFilters, lang]
    );

    useEffect(() => {
        if (!attributesLoading) {
            dispatch({
                type: 'RESET',
                payload: {
                    ...hydratedSettings,
                    initialViewSettings: {
                        viewType: hydratedSettings.viewType,
                        attributesIds: hydratedSettings.attributesIds,
                        sort: hydratedSettings.sort,
                        pageSize: hydratedSettings.pageSize,
                        filters: hydratedSettings.filters
                    }
                }
            });
        }
    }, [attributesLoading]);

    const res = {
        loading: attributesLoading || viewsLoading,
        error: viewError ?? attributesError,
        view,
        dispatch
    };

    return res;
};
