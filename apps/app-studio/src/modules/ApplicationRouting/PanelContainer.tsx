// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useMatch, useNavigate, useParams} from 'react-router-dom';
import cn from 'classnames';
import {SUBMIT_BUTTONS_PORTAL} from '@leav/ui';
import {KitModal, KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {SIDE_PANEL_TARGET_ID} from '../../constants';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/ApplicationSettingsContext';
import {PanelHeader} from './header/PanelHeader';
import {PanelsTabs} from './header/PanelsTabs';
import {AbsolutePaths, RelativePaths} from './router/paths';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {useDisplayConditions} from './utils/useDisplayConditions';

import {selfContainingPanel, popupFormPanel, popupHeader, popupHeaderTabs, sliderFormPanel} from './panel.module.css';

export const PanelContainer: FunctionComponent = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const navigate = useNavigate();
    const refPanel = useRef<KitSidePanelRef | null>(null);
    const [refDivToInsertSidePanel, setRefDivToInsertSidePanel] = useState<HTMLDivElement | null>(null);
    const match = useMatch(AbsolutePaths.recordPanel);

    const {isLastLevelRecordPanel} = useDisplayConditions();

    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId});

    const closeContainer = () => {
        // We delete `recordId/where/recordPanelId` from the URL
        navigate(RelativePaths.closeCurrentPanel, {relative: 'path'});
    };

    useEffect(() => {
        setRefDivToInsertSidePanel(document.getElementById(SIDE_PANEL_TARGET_ID) as HTMLDivElement);
    }, []);

    useEffect(() => {
        if (isLastLevelRecordPanel && where === 'slider') {
            refPanel.current?.open();
        }
    }, [
        refDivToInsertSidePanel,
        match.pathname /* `match.pathname` is used to detect changes in the URL to re-open the side panel */
    ]);

    if (!isLastLevelRecordPanel) {
        return <>{children}</>;
    }

    const isFormPanel = ['editionForm', 'creationForm'].includes(currentPanel.type);

    if (where === 'popup') {
        // TODO: We might need to handle a isSelfContainingPanel case like in the slider case.
        return (
            <KitModal
                className={cn({
                    [popupFormPanel]: isFormPanel
                })}
                isOpen
                height="80vh" // TODO: We might need to change the height and width later (eg: form case). Need to be discussed with PO's and UX's.
                width="90vw"
                title={
                    <div className={popupHeader}>
                        <PanelHeader enabled />
                        <PanelsTabs
                            enabled={!currentPanel.isStandalone}
                            workspaceId={workspaceId}
                            libraryId={libraryId}
                            panelType={panelType}
                            recordId={recordId}
                            currentPanelId={currentPanel.id}
                            className={popupHeaderTabs}
                        />
                    </div>
                }
                footer={<div id={SUBMIT_BUTTONS_PORTAL} />}
                showCloseIcon
                close={closeContainer}
            >
                {children}
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
                          ref={refPanel}
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
                              [sliderFormPanel]: isFormPanel
                          })}
                          ref={refPanel}
                          size="l"
                          headerExtra={<PanelHeader enabled />}
                          onCloseAfterAnimation={closeContainer}
                          floating
                          closable
                          showSeparator
                          closeOnEsc
                      >
                          {children}
                      </KitSidePanel>
                  ),
                  refDivToInsertSidePanel
              )
            : null;
    }

    // Should only happen on where === 'fullpage'
    return <>{children}</>;
};
