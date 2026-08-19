import {useEffect, useLayoutEffect, useRef} from 'react';
import {useRouteParams} from './router/useRouteParams';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {resetPanelViewSettingsInApplication} from './utils/updatePanelViewSettingsInApplication';
import {getIsViewSettingsVoletActive} from './utils/getIsViewSettingsVoletActive';

/**
 * The view settings volet is unique: a single one exists at a time, bound to the foreground explorer.
 * To enforce that, this hook closes the volet for good (resets its state) rather than just hiding it.
 *
 * Two distinct triggers close it:
 * - a next-level panel opens (a record in a popup/slider/fullpage): the explorer loses the foreground;
 * - a flap opens: the flap does not hide the volet (the volet floats on top of it), but we close it
 *   anyway so the volet does not cover the freshly-opened flap.
 *
 * Opening the volet while a flap is ALREADY open keeps both (avoids a UI shift), so we react only to
 * the flap *opening*.
 *
 * A third trigger is navigation itself: when the current panel/workspace changes, the volet subtree is
 * unmounted by the router but its `isViewSettingsActive` flag survives on the application context. An
 * effect cleanup resets the *leaving* panel's volet state so it does not reopen when the user returns.
 *
 * @param hasNextLevelPanel - whether a next-level panel (record) is currently open over this explorer.
 */
export const useViewSettingsAutoClose = (hasNextLevelPanel: boolean): void => {
    const [application, setApplication] = useApplicationSettingsContext();
    const {panelId, recordPanelId, flapPanelId} = useRouteParams();

    const hasFlapPanel = flapPanelId !== undefined;
    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId, panelId});

    const isViewSettingsVoletActive = getIsViewSettingsVoletActive(currentPanel);

    const previousHasFlapPanelRef = useRef(hasFlapPanel);

    // useLayoutEffect (not useEffect) runs after DOM mutations but BEFORE the browser paints. Resetting
    // the volet state here triggers a synchronous re-render before paint, so when a flap opens over an
    // active volet the volet is removed from the shared `extraRight` portal before the user can see the
    // two overlap. A post-paint useEffect would let them flash on the same frame.
    useLayoutEffect(() => {
        const flapJustOpened = !previousHasFlapPanelRef.current && hasFlapPanel;
        previousHasFlapPanelRef.current = hasFlapPanel;

        const shouldCloseViewSettings = isViewSettingsVoletActive && (hasNextLevelPanel || flapJustOpened);
        if (shouldCloseViewSettings && libraryId !== null && panelType !== null) {
            setApplication(prev =>
                resetPanelViewSettingsInApplication(prev, {libraryId, panelType, panelId: currentPanel.id}),
            );
        }
    }, [
        isViewSettingsVoletActive,
        hasNextLevelPanel,
        hasFlapPanel,
        libraryId,
        panelType,
        currentPanel?.id,
        setApplication,
    ]);

    // Reset the leaving panel's volet on panel/workspace change so it does not reopen on return.
    // The flag lives on the long-lived application context and survives navigation; nothing else
    // clears it when the volet subtree is unmounted by a route change (onCloseAfterAnimation fires
    // only on an animated close). isViewSettingsVoletActive is in the deps so the cleanup closure is
    // refreshed when the volet opens without a panel-id change — otherwise it would capture a stale
    // "inactive" snapshot and skip the reset.
    useEffect(() => {
        if (!isViewSettingsVoletActive || libraryId === null || panelType === null) {
            return;
        }
        const location = {libraryId, panelType, panelId: currentPanel.id};
        return () => {
            setApplication(prev => resetPanelViewSettingsInApplication(prev, location));
        };
    }, [currentPanel?.id, isViewSettingsVoletActive, libraryId, panelType, setApplication]);
};
