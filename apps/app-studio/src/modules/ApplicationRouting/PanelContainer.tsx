// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useCallback, useRef} from 'react';
import {useMatch, useNavigate, useParams} from 'react-router-dom';
import cn from 'classnames';
import {Explorer, SUBMIT_BUTTONS_PORTAL} from '@leav/ui';
import {KitModal, KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {PanelHeader} from './header/PanelHeader';
import {PanelsTabs} from './header/tabs/PanelsTabs';
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
    const {isLastLevelRecordPanel} = useDisplayConditions();
    const navigate = useNavigate();
    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId});
    const explorerContainerRef = useRef<HTMLDivElement>(null);
    const match = useMatch(AbsolutePaths.recordPanel);

    const hasFlapPanel = flapPanelId !== undefined;
    const isCreationFormPanel = currentPanel.type === 'creationForm';
    const isFormPanel = isCreationFormPanel || currentPanel.type === 'editionForm';

    const setPanelRef = useCallback(
        (panelRef: KitSidePanelRef | null) => {
            if (panelRef && isLastLevelRecordPanel && where === 'slider') {
                panelRef.open();
            }
        },
        [isLastLevelRecordPanel, where, match.pathname],
    );

    const closeContainer = () => {
        const closingPath = hasFlapPanel
            ? RelativePaths.closeCurrentPanel + '/' + RelativePaths.closeFlapPanel
            : RelativePaths.closeCurrentPanel;
        navigate(closingPath, {relative: 'path'});
    };

    if (!isLastLevelRecordPanel) {
        return <>{children}</>;
    }

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
                <div className={popupContent} ref={explorerContainerRef}>
                    <Explorer.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                        {children}
                    </Explorer.EditSettingsContextProvider>
                </div>
            </KitModal>
        );
    }

    if (where === 'slider') {
        const isSelfContainingPanel = currentPanel.type === 'custom' && currentPanel.isSelfContaining;

        return isSelfContainingPanel ? (
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
                {children}
            </KitSidePanel>
        );
    }

    // Should only happen on where === 'fullpage'
    return <>{children}</>;
};
