import {useExplorerAttributesLazyQuery, useMeQuery} from '_ui/_gqlTypes';
import {useRef} from 'react';
import {useViewSettingsContext} from './manage-view-settings/store-view-settings/useViewSettingsContext';
import {type IUserView} from './_types';
import {useEditSettings, ViewSettingsActionTypes} from './manage-view-settings';
import {mapViewTypeFromExplorerToLegacy, mapViewTypeFromLegacyToExplorer} from './_constants';
import {type IViewSettingsActionLoadViewPayload} from './manage-view-settings/store-view-settings/viewSettingsReducer';
import {useFiltersContext} from '_ui/components/Filters/useFiltersContext';
import {FiltersActionTypes} from '_ui/components/Filters/context/filtersReducer';
import {type ValidFilter} from '../Filters/_types';

export const useLoadView = () => {
    const {view, dispatch} = useViewSettingsContext();
    const {dispatch: filtersDispatch} = useFiltersContext();
    const {closeSettingsPanel} = useEditSettings();
    const currentView = useRef<IUserView | null>(null);

    const [fetchAttributes] = useExplorerAttributesLazyQuery({
        fetchPolicy: 'network-only',
    });

    const {data} = useMeQuery();

    return {
        loadView: async (viewId: string | null) => {
            let viewData: IUserView | null;
            if (!viewId) {
                viewData = {
                    ...view.defaultViewSettings,
                    id: null,
                    ownerId: data?.me?.whoAmI?.id ?? null,
                    display: {type: mapViewTypeFromExplorerToLegacy[view.viewType]},
                    label: {},
                    shared: false,
                    filters: view.defaultViewSettings.filters as ValidFilter[],
                };
            } else {
                viewData = view.savedViews.find(v => v.id === viewId) ?? null;
            }

            if (!viewData) {
                return;
            }

            currentView.current = viewData;

            const attributesToHydrate = [
                ...new Set([...(viewData?.filters ?? []), ...(viewData?.sort ?? [])].map(({field}) => field)),
            ];

            const fetchAttributesResult = await fetchAttributes({
                variables: {
                    ids: attributesToHydrate,
                },
            });

            closeSettingsPanel();

            const attributesDataById = (fetchAttributesResult.data?.attributes?.list ?? []).reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {});

            const viewSettings: IViewSettingsActionLoadViewPayload = {
                viewId: currentView.current?.id ?? null,
                viewLabels: currentView.current?.label ?? {},
                viewType: currentView.current?.display
                    ? mapViewTypeFromLegacyToExplorer[currentView.current?.display.type]
                    : view.viewType,
                attributesIds: currentView.current?.attributes ?? [],
                sort: (currentView.current?.sort ?? []).map(s => ({
                    field: s.field,
                    order: s.order,
                })),
            };

            dispatch({
                type: ViewSettingsActionTypes.LOAD_VIEW,
                payload: viewSettings,
            });
            filtersDispatch({
                type: FiltersActionTypes.LOAD_VIEW,
                payload: {
                    viewId: currentView.current?.id ?? null,
                    filters: [],
                    attributesDataById,
                },
            });
        },
    };
};
