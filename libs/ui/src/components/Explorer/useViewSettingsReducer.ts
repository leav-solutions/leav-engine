// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useMemo, useReducer, useState} from 'react';
import {
    type GetViewsListQuery,
    useExplorerAttributesQuery,
    useExplorerLinkAttributeQuery,
    useGetViewsListQuery,
    ViewSizes
} from '_ui/_gqlTypes';
import {type DefaultViewSettings, type Entrypoint, type IEntrypointLink} from './_types';
import {mapViewTypeFromLegacyToExplorer} from './_constants';
import {
    type IViewSettingsState,
    useEditSettings,
    viewSettingsInitialState,
    viewSettingsReducer
} from './manage-view-settings';
import {
    type AttributesById,
    isLinkAttributeDetails,
    useTransformFilters
} from '_ui/components/Filters/useTransformFilters';

const _areDifferents = <T extends object>(object1: T, object2: T) =>
    Object.keys(object1).some(key => object1[key] !== object2[key]);

export const useViewSettingsReducer = (
    entrypoint: Entrypoint,
    defaultViewSettings: DefaultViewSettings = {},
    ignoreViewByDefault: boolean
) => {
    /**
     * Should be `true` during all the warm up, until we `RESET` the view.
     */
    const [loading, setLoading] = useState(true);
    const [libraryId, setLibraryId] = useState(entrypoint.type === 'library' ? entrypoint.libraryId : null);
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);
    const {closeSettingsPanel} = useEditSettings();

    // FIXME: should be two methods taking `lang` as argument
    const {toValidFilters} = useTransformFilters();

    /**
     * We need to check if the `props.entrypoint` has changed to detect a new `props.entrypoint.libraryId`.
     *
     * If `false`, we reload from scratch and close the side panel that contains the views.
     */
    const needToReloadViewsFromScratch = _areDifferents(entrypoint, view.entrypoint);

    useEffect(() => {
        if (needToReloadViewsFromScratch) {
            setLoading(true);
            setLibraryId(entrypoint.type === 'library' ? entrypoint.libraryId : null);
            closeSettingsPanel();
        }
    }, [needToReloadViewsFromScratch]);

    /**
     * On `entrypoint.type === 'link'`, we need to get the library id from the link attribute to get views et set up `<Explorer />`
     */
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
            setLibraryId(isLinkAttributeDetails(attributeData) ? (attributeData.linked_library?.id ?? '') : null);
        }
    });

    const {
        /**
         * List of my views and shared views
         */
        data: viewData,
        loading: viewsLoading,
        error: viewError
    } = useGetViewsListQuery({
        skip: libraryId === null,
        variables: {
            libraryId: libraryId as string
        }
    });

    let userView: GetViewsListQuery['views']['list'][number] | undefined;
    if (defaultViewSettings?.viewId) {
        userView = viewData?.views?.list?.find(viewItem => viewItem.id === defaultViewSettings.viewId);
    }
    // On still `undefined` view, we take the last added one
    userView = userView ?? viewData?.views?.list?.at(-1);

    const userViewFilters = ignoreViewByDefault ? [] : toValidFilters(userView?.filters ?? []);

    const userAttributesToHydrate = ignoreViewByDefault
        ? []
        : [
              ...userViewFilters,
              ...(userView?.sort ?? []),
              ...(userView?.attributes?.map(attribute => ({field: attribute.id})) ?? [])
          ];

    const preparedDefaultFilters = toValidFilters(defaultViewSettings.filters ?? []);

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
            (attributesData?.attributes?.list ?? []).reduce<AttributesById>((acc, attr) => {
                if (attr.permissions.access_attribute) {
                    acc[attr.id] = attr;
                }
                return acc;
            }, {}),
        [attributesData]
    );

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
            /**
             * Filters merged from `<Explorer />` props and `view`.
             * > Could include hidden filters too.
             */
            const defaultSorts = defaultViewSettings?.sort ?? [];
            const userViewSorts = ignoreViewByDefault ? [] : (userView?.sort ?? []);
            const defaultAttributesIds = (defaultViewSettings?.attributesIds ?? []).filter(
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
                attributesIds: defaultAttributesIds.length > 0 ? defaultAttributesIds : userViewAttributesIds,
                sort: (defaultSorts.length > 0 ? defaultSorts : userViewSorts)
                    .map(s => ({
                        field: s.field,
                        order: s.order
                    }))
                    .filter(s => attributesDataById[s.field])
            };
            dispatch({
                type: 'RESET',
                payload: {
                    ...hydratedSettings,
                    initialViewSettings: {
                        viewType: hydratedSettings.viewType,
                        attributesIds: hydratedSettings.attributesIds,
                        sort: hydratedSettings.sort,
                        pageSize: hydratedSettings.pageSize
                    },
                    defaultViewSettings: {
                        viewType: defaultViewSettings.viewType ?? 'table',
                        attributesIds: defaultViewSettings.attributesIds ?? [],
                        sort: defaultViewSettings.sort ?? []
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
