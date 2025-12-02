// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useMatch, useNavigate, useParams} from 'react-router-dom';
import cn from 'classnames';
import {SUBMIT_BUTTONS_PORTAL} from '@leav/ui';
import {KitModal, KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {FLAP_FULLPAGE_TARGET_ID, SIDE_PANEL_TARGET_ID} from '../../constants';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {PanelHeader} from './header/PanelHeader';
import {PanelsTabs} from './header/tabs/PanelsTabs';
import {FlapContainer} from './FlapContainer';
import {AbsolutePaths, RelativePaths} from './router/paths';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {useDisplayConditions} from './utils/useDisplayConditions';
import {
    selfContainingPanel,
    popupPanel,
    popupHeader,
    popupHeaderTabs,
    sliderFormPanel,
    popupContent,
    popupCreationFormPanel,
} from './panel.module.css';

export const PanelContainer: FunctionComponent = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();
    const navigate = useNavigate();
    const [refDivToInsertSidePanel, setRefDivToInsertSidePanel] = useState<HTMLDivElement | null>(null);
    const [refDivToInsertFlapPanel, setRefDivToInsertFlapPanel] = useState<HTMLDivElement | null>(null);
    const {isLastLevelRecordPanel} = useDisplayConditions();
    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId});
    const match = useMatch(AbsolutePaths.recordPanel);
    const hasFlapPanel = flapPanelId !== undefined;
    const isCreationFormPanel = currentPanel.type === 'creationForm';
    const isFormPanel = isCreationFormPanel || currentPanel.type === 'editionForm';

    useEffect(() => {
        setRefDivToInsertSidePanel(document.getElementById(SIDE_PANEL_TARGET_ID) as HTMLDivElement);

        if (where === 'fullpage') {
            setRefDivToInsertFlapPanel(document.getElementById(FLAP_FULLPAGE_TARGET_ID) as HTMLDivElement);
        }
    }, [where]);

    const setPanelRef = useCallback(
        (panelRef: KitSidePanelRef | null) => {
            if (panelRef && isLastLevelRecordPanel && where === 'slider') {
                panelRef.open();
            }
        },
        [isLastLevelRecordPanel, where, match.pathname],
    );

    const setFlapRef = useCallback(
        (flapRef: KitSidePanelRef | null) => {
            if (hasFlapPanel && flapRef) {
                flapRef.open();
            }
        },
        [hasFlapPanel, match.pathname],
    );

    if (!isLastLevelRecordPanel) {
        return <>{children}</>;
    }

    const closeContainer = () => {
        const closingPath = hasFlapPanel
            ? RelativePaths.closeCurrentPanel + '/' + RelativePaths.closeFlapPanel
            : RelativePaths.closeCurrentPanel;
        navigate(closingPath, {relative: 'path'});
    };

    if (where === 'popup') {
        // TODO: We might need to handle a isSelfContainingPanel case like in the slider case.
        return (
            <KitModal
                className={popupPanel}
                portalClassName={cn({
                    [popupCreationFormPanel]: isCreationFormPanel,
                })}
                width={isCreationFormPanel ? 'revert-layer' : undefined} // Use revert-layer to inherit the width from the popupCreationFormPanel (as modal use html with style attribute)
                height={isCreationFormPanel ? 'revert-layer' : undefined} // Use revert-layer to inherit the height from the popupCreationFormPanel (as modal use html with style attribute)
                title={
                    <div className={popupHeader}>
                        <PanelHeader enabled />
                        <PanelsTabs
                            enabled={!currentPanel.isStandalone}
                            workspaceId={workspaceId}
                            libraryId={libraryId}
                            panelType={panelType}
                            recordId={recordId}
                            hasFlapPanel={hasFlapPanel}
                            where={where}
                            currentPanelId={currentPanel.id}
                            className={popupHeaderTabs}
                        />
                    </div>
                }
                footer={isCreationFormPanel ? <div id={SUBMIT_BUTTONS_PORTAL} /> : null}
                showCloseIcon
                close={closeContainer}
                fullscreen={!isCreationFormPanel}
                isOpen
            >
                <div className={popupContent}>
                    {children}
                    {hasFlapPanel && <FlapContainer ref={setFlapRef} />}
                </div>
            </KitModal>
        );
    }

    if (where === 'slider') {
        const isSelfContainingPanel = currentPanel.type === 'custom' && currentPanel.isSelfContaining;

        return refDivToInsertSidePanel
            ? createPortal(
                  isSelfContainingPanel ? (
                      <KitSidePanel
                          className={selfContainingPanel}
                          ref={setPanelRef}
                          size="l"
                          onCloseAfterAnimation={closeContainer}
                          floating
                          useChildrenOnly
                          closeOnEsc
                      >
                          {children}
                      </KitSidePanel>
                  ) : (
                      <KitSidePanel
                          className={cn({
                              [sliderFormPanel]: isFormPanel,
                          })}
                          ref={setPanelRef}
                          size="l"
                          headerExtra={<PanelHeader actionPosition="right" enabled />}
                          onCloseAfterAnimation={closeContainer}
                          floating
                          closable
                          showSeparator
                          closeOnEsc
                      >
                          {hasFlapPanel ? <FlapContainer ref={setFlapRef} /> : children}
                      </KitSidePanel>
                  ),
                  refDivToInsertSidePanel,
              )
            : null;
    }

    // Should only happen on where === 'fullpage'
    return (
        <>
            {children}
            {hasFlapPanel &&
                refDivToInsertFlapPanel &&
                createPortal(<FlapContainer ref={setFlapRef} />, refDivToInsertFlapPanel)}
        </>
    );
};
