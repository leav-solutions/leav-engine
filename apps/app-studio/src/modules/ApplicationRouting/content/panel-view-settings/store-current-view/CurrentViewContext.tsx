import {createContext, type Dispatch} from 'react';
import {type SerializedViewV2} from '@leav/ui';
import {type CurrentViewAction, type CurrentView} from './_types';

export const CurrentViewContext = createContext<{
    view: CurrentView;
    savedView: CurrentView;
    // No view is targeted (default state)
    isEmptyView: boolean;
    // The view to display is not known yet (last-used-view lookup or view-content query in flight).
    // Distinct from `isEmptyView`: the explorer must wait rather than fall back to its default view.
    // Optional (like `serializedView`/`origin`): consumers read it falsy-safe, volet-only test harnesses omit it.
    isViewResolving?: boolean;
    // Whether the current user holds the `manage_views` permission on the displayed library — drives
    // every admin affordance of the volet (rename/save/delete/share others' views, reference view,
    // available-attributes wheel). Resolved once by the provider, `false` while loading.
    canManageViews: boolean;
    dispatch: Dispatch<CurrentViewAction>;
    // The live (possibly unsaved) view serialized for ExplorerV2's controlled `currentView` prop.
    // Read by `useViewSettingsProps`; left undefined by the volet-only test harnesses.
    serializedView?: SerializedViewV2;
    // View kind scoping the catalog: the originating custom panelId for a custom panel, undefined for
    // an explorer panel. Drives `viewsV2(origin)` and the origin stamped on views created here.
    origin?: string;
}>({
    view: null,
    savedView: null,
    isEmptyView: false,
    isViewResolving: false,
    canManageViews: false,
    serializedView: undefined,
    origin: undefined,
    dispatch: () => {
        throw new Error('useCurrentView must be used inside a <CurrentViewStoreProvider />');
    },
});
