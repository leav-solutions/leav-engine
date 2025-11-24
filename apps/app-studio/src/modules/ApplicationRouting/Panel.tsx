// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useParams, useRoutes} from 'react-router-dom';
import cn from 'classnames';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {PanelContent} from './content/PanelContent';
import {nextLevelRoutes} from './router/routes';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {useDisplayConditions} from './utils/useDisplayConditions';
import {PanelsTabs} from './header/tabs/PanelsTabs';
import {PanelHeader} from './header/PanelHeader';

import {content, fullpageContent, fullpagePage, page, pageHeader} from './panel.module.css';

export const Panel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();

    const NextLevelRoutes = useRoutes(nextLevelRoutes);

    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId, panelId});

    const {isLastFullpagePanel, isLastLevelRecordPanel, isFirstPanel} = useDisplayConditions();

    const currentWorkspace = application.workspaces.find(({id}) => id === workspaceId);

    const currentRecordId = isFirstPanel && currentWorkspace.type === 'record' ? currentWorkspace.recordId : recordId;

    return isLastFullpagePanel || isLastLevelRecordPanel ? (
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
                        flapRecordId={flapRecordId}
                        flapLibraryId={flapLibraryId}
                        flapPanelId={flapPanelId}
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
    ) : (
        NextLevelRoutes
    );
};
