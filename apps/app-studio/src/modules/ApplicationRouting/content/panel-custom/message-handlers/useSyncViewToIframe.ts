import {useContext, useEffect, useRef} from 'react';
import {useRouteParams} from '../../../router/useRouteParams';
import {type SerializedViewV2} from '@leav/ui';
import {CurrentViewContext} from '../../panel-view-settings/store-current-view/CurrentViewContext';

/**
 * Host → iframe sync: pushes the hub's current serialized view to this custom panel's iframe whenever
 * its CONTENT changes (view load, volet edit, RESET, view selection). Reads `serializedView` straight
 * from `CurrentViewContext` — outside a `CurrentViewStoreProvider` (a plain custom panel) it is
 * undefined, so nothing is pushed. The `pushViewSettingsUpdate` sender posts directly to this frame only.
 *
 * Deduped by serialized content, NOT by reference: `serializedView` gets a fresh object reference on
 * every `view` change, including no-op ones — e.g. opening the volet runs the gear's available-columns/
 * sorts/filters queries which dispatch SET_AVAILABLE_* and rebuild `view` without touching the visible/
 * pinned content the serializer keeps. Pushing on the bare reference would replay a view-settings-update
 * to the iframe on every volet open/close, making the panel (e.g. planning) reload for no real change.
 */
export const useSyncViewToIframe = (
    pushViewSettingsUpdate: (data: {targetPanelId: string; serializedView: SerializedViewV2}) => void,
) => {
    const {serializedView} = useContext(CurrentViewContext);
    const {panelId, recordPanelId} = useRouteParams();
    const targetPanelId = recordPanelId ?? panelId;
    const lastPushedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!serializedView || !targetPanelId) {
            return;
        }
        const serialized = JSON.stringify(serializedView);
        if (serialized === lastPushedRef.current) {
            return;
        }
        lastPushedRef.current = serialized;
        pushViewSettingsUpdate({targetPanelId, serializedView});
    }, [serializedView, targetPanelId, pushViewSettingsUpdate]);
};
