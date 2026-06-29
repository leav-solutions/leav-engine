import {type ReactNode, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {usePanelEventHandlers, useUser} from '@leav/ui';
import {useGetViewV2Query} from '../../../../../__generated__';
import {type AppStudioInternalEvent} from '../../../types';
import {useLastUsedView} from '../tabs/tab-catalog/useLastUsedView';
import {useCanManageViews} from './useCanManageViews';
import {CurrentViewContext} from './CurrentViewContext';
import {DEFAULT_DRAFT_VIEW_ID} from './_constants';
import {currentViewReducer, initialCurrentViewState} from './currentViewReducer';
import {viewV2ToSerializedView} from './viewV2ToSerializedView';

/**
 * Single source of truth for the "current (possibly unsaved) view" of an explorer panel (ADR-006:
 * app-studio owns the view, shared by the explorer and the view-settings volet).
 *
 * Mounted once per explorer panel in `Panel` — ABOVE the conditionally-rendered volet — so the
 * editing state survives the volet closing/reopening (the bug it fixes). The volet consumes it via
 * `useCurrentView`; the explorer reads `serializedView` via `useViewSettingsProps`. This replaces the
 * former `view-settings-current-view-changed` event mirror and the duplicated `liveView` state.
 */
export const CurrentViewStoreProvider = ({
    viewId,
    displayedLibraryId,
    children,
}: {
    viewId?: string;
    displayedLibraryId?: string;
    children: ReactNode;
}) => {
    const [{view, savedView}, dispatch] = useReducer(currentViewReducer, initialCurrentViewState);
    const canManageViews = useCanManageViews(displayedLibraryId);
    const {userData} = useUser();

    // The catalog selection (and save-as) switches the loaded view through this event. The handler only
    // calls the stable setter, so it is safe despite usePanelEventHandlers registering it once.
    const [selectedViewId, setSelectedViewId] = useState<string | undefined>(undefined);
    usePanelEventHandlers<AppStudioInternalEvent>({
        'view-settings-select-view': data => setSelectedViewId(data.viewId),
    });

    const {lastUsedViewId} = useLastUsedView();

    // Derived (not stored) so the async-resolved `lastUsedViewId` is taken into account on each render.
    const currentViewId = selectedViewId ?? lastUsedViewId ?? viewId;

    const {data, loading} = useGetViewV2Query({
        variables: {viewId: currentViewId as string},
        skip: !currentViewId,
        // An unresolvable id (v1 view, deleted, no permission, unknown) must degrade to the empty
        // state, not crash the panel. The global errorLink only console.warns GraphQL errors (no
        // toast), so this stays silent UI-side.
        errorPolicy: 'ignore',
    });

    // A resolved view belonging to a DIFFERENT library than the one this explorer displays must never
    // be applied (guards against a stale or cross-library view id — e.g. carried over from another
    // panel — reaching this explorer). The fragment already fetches `library`, so this costs nothing.
    const isForeignView =
        Boolean(data?.viewV2) && Boolean(displayedLibraryId) && data.viewV2.library !== displayedLibraryId;

    // No view resolvable — either nothing is targeted, or the targeted id doesn't resolve to a usable
    // v2 view (unknown/deleted/no-permission/foreign-library) once the fetch settles. Either way the
    // panel falls back to its default (empty) state: the catalog stays reachable so a view can be
    // selected, and the header renders read-only.
    const viewUnresolvable = Boolean(currentViewId) && !loading && (!data?.viewV2 || isForeignView);
    const isEmptyView = !currentViewId || viewUnresolvable;

    // Load the freshly-fetched view whenever a DIFFERENT view arrives. Guarding on the last loaded
    // id (rather than a one-shot flag) lets the catalog switch views while still ignoring background
    // refetches of the same id, which must not clobber unsaved in-memory edits (R4). A foreign-library
    // view is never loaded — it must drop the panel to its empty state, not show another lib's view.
    const loadedViewIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (data?.viewV2 && !isForeignView && data.viewV2.id !== loadedViewIdRef.current) {
            loadedViewIdRef.current = data.viewV2.id;
            dispatch({type: 'LOAD_VIEW', payload: data.viewV2});
        }
    }, [data, isForeignView]);

    // Views-manager empty state: seed a synthetic, editable draft so the manager can configure a
    // default view (gear attributes query resolves via `library`, columns/sorts edits apply,
    // isDirty/Reset work) and preview it live. The `DEFAULT_DRAFT_VIEW_ID` guard avoids clobbering
    // in-progress edits AND replaces a stale real view still held in the reducer when we fall back to
    // `isEmptyView`.
    useEffect(() => {
        if (isEmptyView && canManageViews && displayedLibraryId && view?.id !== DEFAULT_DRAFT_VIEW_ID) {
            dispatch({
                type: 'INIT_DEFAULT_VIEW',
                payload: {library: displayedLibraryId, createdBy: {id: userData?.userId ?? '', label: ''}},
            });
        }
    }, [isEmptyView, canManageViews, displayedLibraryId, view?.id, userData?.userId]);

    // The live (possibly unsaved) view, serialized for ExplorerV2's controlled `currentView` prop.
    // Gated on `!isEmptyView` so switching from a valid id to an unresolvable one drops the Explorer
    // back to its empty view instead of re-showing the previous view still held in the reducer — but
    // the admin's synthetic default draft IS serialized so its edits preview live.
    const serializedView = useMemo(
        () => (view && (!isEmptyView || view.id === DEFAULT_DRAFT_VIEW_ID) ? viewV2ToSerializedView(view) : undefined),
        [view, isEmptyView],
    );

    const value = useMemo(
        () => ({view, savedView, isEmptyView, canManageViews, dispatch, serializedView}),
        [view, savedView, isEmptyView, canManageViews, serializedView],
    );

    return <CurrentViewContext.Provider value={value}>{children}</CurrentViewContext.Provider>;
};
