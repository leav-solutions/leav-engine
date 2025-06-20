// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    useExplorerAttributesQuery,
    useExplorerLinkAttributeQuery,
    useGetViewsListQuery,
    ViewSizes
} from '_ui/_gqlTypes';
import {useEffect, useMemo, useReducer, useState} from 'react';
import {DefaultViewSettings, Entrypoint, IEntrypointLink} from './_types';
import {
    IViewSettingsState,
    useEditSettings,
    viewSettingsInitialState,
    viewSettingsReducer
} from './manage-view-settings';
import {mapViewTypeFromLegacyToExplorer} from './_constants';
import {
    _isLinkAttributeDetails,
    _isValidFieldFilter,
    _isValidFieldFilterThrough,
    useTransformFilters
} from './manage-view-settings/_shared/useTransformFilters';
import {ignore} from 'antd/es/theme/useToken';

const _entrypointsAreEqual = (entrypoint1, entrypoint2) =>
    Object.keys(entrypoint1).every(key => entrypoint1[key] === entrypoint2[key]);

export const useViewSettingsReducer = (
    entrypoint: Entrypoint,
    defaultViewSettings: DefaultViewSettings = {},
    ignoreViewByDefault = false
) => {
    const [loading, setLoading] = useState(true);
    const [libraryId, setLibraryId] = useState(entrypoint.type === 'library' ? entrypoint.libraryId : null);
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);
    const {closeSettingsPanel} = useEditSettings();
    const entrypointsAreEqual = _entrypointsAreEqual(entrypoint, view.entrypoint);
    const {toExplorerFilters, toValidFilters} = useTransformFilters();

    useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId
        },
        onCompleted: data => {
            const attributeData = data?.attributes?.list?.[0];
            if (!attributeData) {
                throw new Error('Unknown link attribute');
            }
            setLibraryId(_isLinkAttributeDetails(attributeData) ? (attributeData.linked_library?.id ?? '') : null);
        }
    });

    const {
        data: viewData,
        loading: viewsLoading,
        error: viewError
    } = useGetViewsListQuery({
        skip: entrypointsAreEqual || libraryId === null,
        fetchPolicy: 'network-only',
        variables: {
            libraryId: libraryId as string
        }
    });

    let userView;
    if (defaultViewSettings?.viewId) {
        userView = viewData?.views?.list?.find(viewItem => viewItem.id === defaultViewSettings.viewId);
    }

    // Take the last view from the array if not defined in defaultView Settings
    userView = userView ?? viewData?.views?.list?.at(-1);

    const userViewFilters = ignoreViewByDefault ? [] : toValidFilters(userView?.filters ?? []);
    const preparedDefaultFilters = toValidFilters(defaultViewSettings.filters ?? []);

    const userAttributesToHydrate = ignoreViewByDefault
        ? []
        : [
              ...userViewFilters,
              ...(userView?.sort ?? []),
              ...(userView?.attributes?.map(attribute => ({field: attribute.id})) ?? [])
          ];

    const attributesToHydrate = [
        ...new Set(
            [
                ...(preparedDefaultFilters ?? []),
                ...(defaultViewSettings.sort ?? []),
                ...userAttributesToHydrate,
                ...(defaultViewSettings?.attributesIds?.map(attributeId => ({field: attributeId})) ?? [])
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
                if (attr.permissions.access_attribute) {
                    acc[attr.id] = attr;
                }
                return acc;
            }, {}),
        [attributesData]
    );

    useEffect(() => {
        if (!entrypointsAreEqual) {
            setLoading(true);
            setLibraryId(entrypoint.type === 'library' ? entrypoint.libraryId : null);
            closeSettingsPanel();
        }
    }, [entrypointsAreEqual]);

    useEffect(() => {
        if (libraryId !== null && !viewsLoading && !attributesLoading) {
            const savedViews = (viewData?.views.list ?? []).map(
                ({id, label, shared, display, filters, sort, attributes, created_by}) => ({
                    id,
                    ownerId: created_by.id,
                    label,
                    shared,
                    display: {type: display.type, size: display.size || ViewSizes.MEDIUM},
                    filters: toValidFilters(filters ?? []),
                    sort: sort ?? [],
                    attributes: attributes?.map(attribute => attribute.id) ?? []
                })
            );
            const allFilters = preparedDefaultFilters.length > 0 ? preparedDefaultFilters : userViewFilters;
            const defaultSorts = defaultViewSettings?.sort ?? [];
            const userViewSorts = ignoreViewByDefault ? [] : (userView?.sort ?? []);
            const defaultattributesIds = (defaultViewSettings?.attributesIds ?? []).filter(
                attr => attributesDataById[attr]
            );
            const userViewAttributesIds = ignoreViewByDefault
                ? []
                : (userView?.attributes ?? []).map(attr => attr.id).filter(attr => attributesDataById[attr]);

            let viewProps = {};
            if (!ignoreViewByDefault) {
                viewProps = {
                    viewId: userView?.id ?? null,
                    viewLabels: userView?.label ?? {},
                    viewType: userView?.display
                        ? mapViewTypeFromLegacyToExplorer[userView.display.type]
                        : viewSettingsInitialState.viewType
                };
            }

            const hydratedSettings: IViewSettingsState = {
                ...viewSettingsInitialState,
                entrypoint,
                libraryId,
                ...viewProps,
                savedViews,
                ...defaultViewSettings,
                attributesIds: defaultattributesIds.length > 0 ? defaultattributesIds : userViewAttributesIds,
                sort: (defaultSorts.length > 0 ? defaultSorts : userViewSorts)
                    .map(s => ({
                        field: s.field,
                        order: s.order
                    }))
                    .filter(s => attributesDataById[s.field]),
                filtersOperator: defaultViewSettings?.filtersOperator ?? 'AND',
                filters: toExplorerFilters({filters: allFilters, attributesDataById})
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
                    },
                    defaultViewSettings: {
                        viewType: defaultViewSettings.viewType ?? 'table',
                        attributesIds: defaultViewSettings.attributesIds ?? [],
                        sort: defaultViewSettings.sort ?? [],
                        filters: defaultViewSettings.filters ?? []
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
