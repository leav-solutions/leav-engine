import {useLayoutEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
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
 * @param hasNextLevelPanel - whether a next-level panel (record) is currently open over this explorer.
 */
export const useViewSettingsAutoClose = (hasNextLevelPanel: boolean): void => {
    const [application, setApplication] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();

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
};
