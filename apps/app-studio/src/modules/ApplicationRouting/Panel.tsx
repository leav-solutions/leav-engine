import {useCallback, useEffect, useState, type FunctionComponent} from 'react';
import {useMatch, useParams, useRoutes} from 'react-router-dom';
import cn from 'classnames';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {PanelContent} from './content/PanelContent';
import {nextLevelRoutes} from './router/routes';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {PanelsTabs} from './header/tabs/PanelsTabs';
import {PanelHeader} from './header/PanelHeader';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {AbsolutePaths} from './router/paths';
import {FlapContainer} from './FlapContainer';
import {panel, panelContent, firstPanel, firstPanelContent, panelHeader} from './panel.module.css';
import {createPortal} from 'react-dom';
import {MODAL_EXTRA_RIGHT_PORTAL_ID} from '../../constants';

export const Panel: FunctionComponent = () => {
    const [modalExtraRightElement, setModalExtraRightElement] = useState<HTMLElement>();
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();
    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId, panelId});
    const NextLevelRoutes = useRoutes(nextLevelRoutes);
    const match = useMatch(AbsolutePaths.recordPanel);

    const isFirstPanel = where === undefined;
    const isPanelInSlider = where === 'slider';
    const currentWorkspace = application.workspaces.find(({id}) => id === workspaceId);
    const currentRecordId = isFirstPanel && currentWorkspace.type === 'record' ? currentWorkspace.recordId : recordId;
    const hasFlapPanel = flapPanelId !== undefined;
    const isCreationFormPanel = currentPanel.type === 'creationForm';

    const setFlapRef = useCallback(
        (flapRef: KitSidePanelRef | null) => {
            if (hasFlapPanel && flapRef) {
                flapRef.open();
            }
        },
        [hasFlapPanel, match?.pathname],
    );

    useEffect(() => {
        if (!isPanelInSlider && hasFlapPanel && !isFirstPanel) {
            const extraRightElement = document.getElementById(`${MODAL_EXTRA_RIGHT_PORTAL_ID}_${recordPanelId}`);
            setModalExtraRightElement(extraRightElement ?? undefined);
        } else {
            setModalExtraRightElement(undefined);
        }
    }, [hasFlapPanel, isFirstPanel, recordPanelId]);

    const flapContainerComponent = modalExtraRightElement ? (
        createPortal(<FlapContainer ref={setFlapRef} />, modalExtraRightElement)
    ) : (
        <FlapContainer ref={setFlapRef} />
    );

    if (isPanelInSlider && hasFlapPanel) {
        return flapContainerComponent;
    }

    return (
        <>
            <section
                className={cn(panel, {
                    [firstPanel]: isFirstPanel,
                })}
            >
                {(isFirstPanel || !currentPanel.isStandalone) && (
                    <div className={panelHeader}>
                        {/* `fullpage`, `popup` and `slider` are managed by `<PanelContainer />` */}
                        {isFirstPanel && (
                            <PanelHeader
                                currentRecordId={currentRecordId}
                                hidePanelDisplayModeSelector={isCreationFormPanel}
                            />
                        )}
                        <PanelsTabs
                            enabled={isPanelInSlider}
                            workspaceId={workspaceId}
                            libraryId={libraryId}
                            panelType={panelType}
                            recordId={currentRecordId}
                            hasFlapPanel={hasFlapPanel}
                            where={where}
                            currentPanelId={currentPanel.id}
                        />
                    </div>
                )}
                <div
                    className={cn(panelContent, {
                        [firstPanelContent]: isFirstPanel,
                    })}
                >
                    <PanelContent
                        key={currentPanel.id}
                        panel={currentPanel}
                        recordId={currentRecordId}
                        libraryId={libraryId}
                    />
                    {NextLevelRoutes}
                </div>
            </section>
            {hasFlapPanel && flapContainerComponent}
        </>
    );
};
