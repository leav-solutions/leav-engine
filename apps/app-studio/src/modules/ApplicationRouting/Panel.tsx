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
import {useDisplayConditions} from './utils/useDisplayConditions';
import {PanelsTabs} from './header/tabs/PanelsTabs';
import {PanelHeader} from './header/PanelHeader';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {AbsolutePaths} from './router/paths';
import {FlapContainer} from './FlapContainer';
import {content, fullpageContent, fullpagePage, page, pageHeader} from './panel.module.css';

export const Panel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();
    const {isLastFullpagePanel, isLastLevelRecordPanel, isFirstPanel} = useDisplayConditions();
    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId, panelId});
    const NextLevelRoutes = useRoutes(nextLevelRoutes);
    const match = useMatch(AbsolutePaths.recordPanel);

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

    if (!isLastFullpagePanel && !isLastLevelRecordPanel) {
        return NextLevelRoutes;
    }

    if (where === 'slider' && hasFlapPanel) {
        return <FlapContainer ref={setFlapRef} />;
    }

    return (
        <>
            <section
                className={cn(page, {
                    [fullpagePage]: isLastFullpagePanel,
                })}
            >
                {(isLastFullpagePanel || !currentPanel.isStandalone) && (
                    <div className={pageHeader}>
                        <PanelHeader
                            enabled={
                                /**
                                 * `popup` and `slider` are managed by `<PanelContainer />`
                                 */
                                isLastFullpagePanel
                            }
                            currentRecordId={currentRecordId}
                        />
                        <PanelsTabs
                            enabled={where !== 'popup' && !currentPanel.isStandalone}
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
                    className={cn(content, {
                        [fullpageContent]: isLastFullpagePanel,
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
