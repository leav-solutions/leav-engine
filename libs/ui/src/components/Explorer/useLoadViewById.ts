import {type Dispatch, useEffect} from 'react';
import {type UIFiltersAction} from '_ui/components/Filters/context/filtersReducer';
import {useLoadView} from './useLoadView';
import {
    type IViewSettingsAction,
    type IViewSettingsState,
} from './manage-view-settings/store-view-settings/viewSettingsReducer';

interface IUseLoadViewByIdArgs {
    loadedViewId: string | null | undefined;
    isLoading: boolean;
    view: IViewSettingsState;
    viewSettingsDispatch: Dispatch<IViewSettingsAction>;
    filtersDispatch: Dispatch<UIFiltersAction>;
}

/**
 * Loads a saved view from the controlled `loadedViewId` prop. Lets an external panel
 * (e.g. viewConfig catalogue) drive the Explorer to a specific saved view without
 * relying on `defaultViewSettings.viewId` (which is read once at mount only).
 *
 * Semantics:
 *   - undefined: parent does not drive — internal flow (SavedViews UI) keeps control
 *   - null: load the default view
 *   - 'X': load saved view 'X'
 *
 * Skipped while bootstrapping (savedViews not populated yet) and when the requested
 * view is already the active one.
 */
export const useLoadViewById = ({
    loadedViewId,
    isLoading,
    view,
    viewSettingsDispatch,
    filtersDispatch,
}: IUseLoadViewByIdArgs) => {
    const {loadView} = useLoadView({view, viewSettingsDispatch, filtersDispatch});

    useEffect(() => {
        if (isLoading || loadedViewId === undefined) {
            return;
        }
        if (loadedViewId === view.viewId) {
            return;
        }
        loadView(loadedViewId);
    }, [loadedViewId, isLoading, view.viewId]);
};
