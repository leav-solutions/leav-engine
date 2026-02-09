// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
import {useMatch, useNavigate, useParams} from 'react-router-dom';
import cn from 'classnames';
import {Explorer, SUBMIT_BUTTONS_PORTAL} from '@leav/ui';
import {KitModal, KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {PanelHeader} from './header/PanelHeader';
import {AbsolutePaths, RelativePaths} from './router/paths';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {
    selfContainingPanel,
    popupContent,
    centerPopupForCreationForm,
    fullpagePopup,
    hiddenPopup,
    centerPopup,
    sliderPanel,
    fullpageOverlay,
    modalExtraRightPortal,
    modalExtraRightPortalWithFlap,
} from './panelContainer.module.css';
import {WORKSPACE_PANEL_CONTAINER_ID, MODAL_EXTRA_RIGHT_PORTAL_ID} from '../../constants';
import {createPortal} from 'react-dom';
import {retrievePreviousPanelURLParams} from './utils/retrievePreviousPanelURLParams';

export const PanelContainer: FunctionComponent = ({children}) => {
    const [modalExtraRightElement, setModalExtraRightElement] = useState<HTMLElement>();
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();
    const navigate = useNavigate();
    const {currentPanel} = retrievePanelDetails({application, recordPanelId});
    const {previousRecordPanelId, isPreviousPanelFirstLevel} = retrievePreviousPanelURLParams({
        recordId,
        where,
        recordPanelId,
    });
    const explorerContainerRef = useRef<HTMLDivElement>(null);
    const match = useMatch(AbsolutePaths.recordPanel);

    const hasFlapPanel = flapPanelId !== undefined;
    const isCreationFormPanel = currentPanel.type === 'creationForm';

    const isPanelInFullpage = where === 'fullpage';
    const isPanelInPopup = where === 'popup';
    const isPanelInSlider = where === 'slider';

    const setPanelRef = useCallback(
        (panelRef: KitSidePanelRef | null) => {
            if (panelRef && isPanelInSlider) {
                panelRef.open();
            }
        },
        [isPanelInSlider, match.pathname],
    );

    useEffect(() => {
        if (isPanelInSlider && !isPreviousPanelFirstLevel) {
            const extraRightElement = document.getElementById(
                `${MODAL_EXTRA_RIGHT_PORTAL_ID}_${previousRecordPanelId}`,
            );
            setModalExtraRightElement(extraRightElement);
        } else {
            setModalExtraRightElement(undefined);
        }
    }, [isPanelInSlider, isPreviousPanelFirstLevel, previousRecordPanelId]);

    const closeContainer = () => {
        const closingPath = hasFlapPanel
            ? RelativePaths.closeCurrentPanel + '/' + RelativePaths.closeFlapPanel
            : RelativePaths.closeCurrentPanel;
        navigate(closingPath, {relative: 'path'});
    };

    if (isPanelInPopup || isPanelInFullpage) {
        const getFullsPagePopupContainer = () => document.querySelector(`#${WORKSPACE_PANEL_CONTAINER_ID}`);

        const _nextLevelPanelInLocationPathname = location.pathname.split(`/${recordId}/${where}/${recordPanelId}`)[1];
        const _nextLevelWhere = _nextLevelPanelInLocationPathname?.split('/')[2];
        const hasPanelInFullpageAfterPopup = isPanelInPopup && _nextLevelWhere === 'fullpage';

        const fullpageModalProps = isPanelInFullpage
            ? {
                  fullscreen: true,
                  parentSelector: getFullsPagePopupContainer,
                  appElement: getFullsPagePopupContainer(),
                  style: {overlay: {position: 'absolute' as const}},
                  width: undefined, // We override the width so the modal is fullscreen
                  height: undefined, // We override the height so the modal is fullscreen
              }
            : {};

        // TODO: We might need to handle a isSelfContainingPanel case like in the slider case.
        return (
            <KitModal
                isOpen
                showCloseIcon={!hasPanelInFullpageAfterPopup}
                className={cn({
                    [centerPopup]: isPanelInPopup,
                    [centerPopupForCreationForm]: isCreationFormPanel,
                    [fullpagePopup]: isPanelInFullpage,
                    [hiddenPopup]: hasPanelInFullpageAfterPopup,
                })}
                portalClassName={cn({
                    [hiddenPopup]: hasPanelInFullpageAfterPopup,
                    [fullpageOverlay]: isPanelInFullpage,
                })}
                width={isCreationFormPanel ? 'revert-layer' : '70vw'} // Use revert-layer to inherit the width from the popupCreationOverlay (as modal use html with style attribute)
                height={isCreationFormPanel ? 'revert-layer' : '70vh'} // Use revert-layer to inherit the height from the popupCreationOverlay (as modal use html with style attribute)
                title={<PanelHeader />}
                footer={isCreationFormPanel ? <div id={SUBMIT_BUTTONS_PORTAL} /> : null}
                close={closeContainer}
                extraRight={
                    <div
                        id={`${MODAL_EXTRA_RIGHT_PORTAL_ID}_${recordPanelId}`}
                        className={cn(modalExtraRightPortal, {
                            [modalExtraRightPortalWithFlap]: hasFlapPanel,
                        })}
                    />
                }
                {...fullpageModalProps}
            >
                <div className={popupContent} ref={explorerContainerRef}>
                    <Explorer.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                        {children}
                    </Explorer.EditSettingsContextProvider>
                </div>
            </KitModal>
        );
    }

    if (isPanelInSlider) {
        const isSelfContainingPanel = currentPanel.type === 'custom' && currentPanel.isSelfContaining;

        const sliderPanelComponent = isSelfContainingPanel ? (
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
                className={sliderPanel}
                ref={setPanelRef}
                size="l"
                headerExtra={<PanelHeader actionPosition="right" hidePanelTabs />}
                onCloseAfterAnimation={closeContainer}
                floating
                closable
                showSeparator
                closeOnEsc
            >
                {children}
            </KitSidePanel>
        );

        if (modalExtraRightElement) {
            return createPortal(sliderPanelComponent, modalExtraRightElement);
        }

        // For the first level slider panel, we return the component directly
        return sliderPanelComponent;
    }
};
