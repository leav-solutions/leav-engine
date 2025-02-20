// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useExplorerAttributesLazyQuery} from '_ui/_gqlTypes';
import {useEffect, useRef} from 'react';
import {useViewSettingsContext} from './manage-view-settings/store-view-settings/useViewSettingsContext';
import {IUserView, validFilter} from './_types';
import {useEditSettings, ViewSettingsActionTypes} from './manage-view-settings';
import {useTransformFilters, validFiltersArgument} from './manage-view-settings/_shared/useTransformFilters';
import {mapViewTypeFromExplorerToLegacy, mapViewTypeFromLegacyToExplorer} from './_constants';
import {IViewSettingsActionLoadViewPayload} from './manage-view-settings/store-view-settings/viewSettingsReducer';

export const useLoadView = () => {
    const {view, dispatch} = useViewSettingsContext();
    const {closeSettingsPanel} = useEditSettings();
    const {toExplorerFilters, toValidFilters} = useTransformFilters();
    const curentView = useRef<IUserView | null>(null);

    const [fetchAttributes, {data: attributesData, loading: attributesLoading}] = useExplorerAttributesLazyQuery({
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (!attributesLoading && attributesData) {
            const attributesDataById = (attributesData?.attributes?.list ?? []).reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {});
            const viewSettings: IViewSettingsActionLoadViewPayload = {
                viewId: curentView.current?.id ?? null,
                viewLabels: curentView.current?.label ?? {},
                viewType: curentView.current?.display
                    ? mapViewTypeFromLegacyToExplorer[curentView.current?.display.type]
                    : view.viewType,
                attributesIds: curentView.current?.attributes ?? [],
                sort: (curentView.current?.sort ?? []).map(s => ({
                    field: s.field,
                    order: s.order
                })),
                filters: toExplorerFilters({
                    filters: toValidFilters((curentView.current?.filters as validFiltersArgument) ?? []),
                    attributesDataById
                })
            };
            dispatch({
                type: ViewSettingsActionTypes.LOAD_VIEW,
                payload: viewSettings
            });
            closeSettingsPanel();
        }
    }, [attributesData, attributesLoading]);

    const loadView = (viewId: string | null) => {
        let viewData: IUserView | null;
        if (!viewId) {
            viewData = {
                ...view.defaultViewSettings,
                id: null,
                display: {type: mapViewTypeFromExplorerToLegacy[view.viewType]},
                label: {},
                shared: false,
                filters: view.defaultViewSettings.filters as validFilter[]
            };
        } else {
            viewData = view.savedViews.find(v => v.id === viewId) ?? null;
        }

        if (!viewData) {
            return;
        }

        curentView.current = viewData;

        const attributesToHydrate = [
            ...new Set([...(viewData?.sort ?? []), ...(viewData?.sort ?? [])].map(({field}) => field))
        ];

        fetchAttributes({
            variables: {
                ids: attributesToHydrate
            }
        });
    };

    return {
        loadView
    };
};
