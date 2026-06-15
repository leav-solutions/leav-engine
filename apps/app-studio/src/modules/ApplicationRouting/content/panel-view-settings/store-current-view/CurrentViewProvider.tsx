import {type ReactNode, useEffect, useReducer, useRef, useState} from 'react';
import {usePanelEventHandlers} from '@leav/ui';
import {useGetViewV2Query} from '../../../../../__generated__';
import {type AppStudioInternalEvent} from '../../../types';
import {CurrentViewContext} from './CurrentViewContext';
import {currentViewReducer, initialCurrentViewState} from './currentViewReducer';

// TODO (LEAVC-809): seed `selectedViewId` from the panel's real currentViewId once views are
// migrated to viewV2. For now we bootstrap on a hardcoded v2 view; the catalog can switch it.
const HARDCODED_VIEW_ID = '2345316100';

export const CurrentViewProvider = ({children}: {children: ReactNode}) => {
    const [{view, savedView}, dispatch] = useReducer(currentViewReducer, initialCurrentViewState);

    const [selectedViewId, setSelectedViewId] = useState(HARDCODED_VIEW_ID);

    // The catalog selection (gated by an unsaved-changes confirmation in TabCatalog) switches the
    // loaded view. The handler only calls the stable setter with the event payload, so it is safe
    // despite usePanelEventHandlers registering it once.
    usePanelEventHandlers<AppStudioInternalEvent>({
        'view-settings-select-view': ({viewId}) => setSelectedViewId(viewId),
    });

    const {data} = useGetViewV2Query({variables: {viewId: selectedViewId}});

    // Load the freshly-fetched view whenever a DIFFERENT view arrives. Guarding on the last loaded
    // id (rather than a one-shot flag) lets the catalog switch views while still ignoring background
    // refetches of the same id, which must not clobber unsaved in-memory edits (R4).
    const loadedViewIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (data?.viewV2 && data.viewV2.id !== loadedViewIdRef.current) {
            loadedViewIdRef.current = data.viewV2.id;
            dispatch({type: 'LOAD_VIEW', payload: data.viewV2});
        }
    }, [data]);

    return <CurrentViewContext.Provider value={{view, savedView, dispatch}}>{children}</CurrentViewContext.Provider>;
};
