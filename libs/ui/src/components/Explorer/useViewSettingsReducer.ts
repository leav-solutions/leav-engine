// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    LinkAttributeDetailsFragment,
    useExplorerAttributesQuery,
    useExplorerLinkAttributeQuery,
    useGetViewsListQuery,
    ViewDetailsFilterFragment
} from '_ui/_gqlTypes';
import {localizedTranslation, Override} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {useEffect, useMemo, useReducer, useState} from 'react';
import {DefaultViewSettings, Entrypoint, IEntrypointLink, IExplorerFilter} from './_types';
import {v4 as uuid} from 'uuid';
import {IViewSettingsState, viewSettingsInitialState, viewSettingsReducer} from './manage-view-settings';
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

export const useViewSettingsReducer = (entrypoint: Entrypoint, defaultViewSettings: DefaultViewSettings = {}) => {
    const {lang} = useLang();
    const [loading, setLoading] = useState(true);
    const [libraryId, setLibraryId] = useState<null | string>(
        entrypoint.type === 'library' ? entrypoint.libraryId : null
    );
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);

    const {loading: linkAttributeLoading} = useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId
        },
        onCompleted: data => {
            // TODO: improve readability, manage error case
            setLibraryId(
                (data &&
                    data.attributes &&
                    data.attributes.list[0] &&
                    (data.attributes.list[0] as LinkAttributeDetailsFragment).linked_library?.id) ??
                    ''
            );
        }
    });

    const {
        data: viewData,
        loading: viewsLoading,
        error: viewError
    } = useGetViewsListQuery({
        skip: libraryId === null,
        variables: {
            libraryId: libraryId as string
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
        ...new Set(
            [
                ...(defaultViewSettings.filters ?? []),
                ...(defaultViewSettings.sort ?? []),
                ...userViewFilters,
                ...(userView?.sort ?? [])
            ].map(({field}) => field)
        )
    ];

    const {
        data: attributesData,
        loading: attributesLoading,
        error: attributesError
    } = useExplorerAttributesQuery({
        variables: {
            ids: attributesToHydrate
        },
        skip: libraryId === null || viewsLoading || attributesToHydrate.length === 0
    });

    const attributesDataById = useMemo(
        () =>
            (attributesData?.attributes?.list ?? []).reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {}),
        [attributesData]
    );

    useEffect(() => {
        if (libraryId !== null && !viewsLoading && !attributesLoading) {
            const hydratedSettings: IViewSettingsState = {
                ...viewSettingsInitialState,
                libraryId,
                viewId: userView?.id,
                viewType: userView?.display
                    ? mapViewTypeFromLegacyToExplorer[userView.display.type]
                    : viewSettingsInitialState.viewType,
                ...defaultViewSettings,
                attributesIds: [
                    ...(userView?.attributes ?? []).map(attr => attr.id),
                    ...(defaultViewSettings?.attributesIds ?? [])
                ],
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
            };
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
            setLoading(false);
        }
    }, [attributesLoading, viewsLoading, libraryId]);

    return {
        loading,
        error: viewError ?? attributesError,
        view,
        dispatch
    };
};
