// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCallback, type FunctionComponent} from 'react';
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

export const Panel: FunctionComponent = () => {
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

    const setFlapRef = useCallback(
        (flapRef: KitSidePanelRef | null) => {
            if (hasFlapPanel && flapRef) {
                flapRef.open();
            }
        },
        [hasFlapPanel, match?.pathname],
    );

    if (isPanelInSlider && hasFlapPanel) {
        return <FlapContainer ref={setFlapRef} />;
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
                        <PanelHeader
                            enabled={
                                /**
                                 * `fullpage`, `popup` and `slider` are managed by `<PanelContainer />`
                                 */
                                isFirstPanel
                            }
                            currentRecordId={currentRecordId}
                        />
                        <PanelsTabs
                            enabled={isFirstPanel || isPanelInSlider}
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
            {hasFlapPanel && <FlapContainer ref={setFlapRef} />}
        </>
    );
};
