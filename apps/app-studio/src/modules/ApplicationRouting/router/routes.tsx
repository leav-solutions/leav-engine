// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RouteObject} from 'react-router-dom';
import {RedirectToFirstPanel} from '../guards/RedirectToFirstPanel';
import {RedirectToFirstWorkspace} from '../guards/RedirectToFirstWorkspace';
import {RedirectToFirstRecordPanel} from '../guards/RedirectToFirstRecordPanel';
import {RedirectToPreviousPanel} from '../guards/RedirectToPreviousPanel';
import {WorkspacesNavigationMenu} from '../workspaces/WorkspacesNavigationMenu';
import {Panel} from '../Panel';
import {PanelContainer} from '../PanelContainer';
import {AbsolutePaths, UnreachablePaths} from './paths';
import {RedirectToFirstRecordPanelAllowedInSlider} from '../guards/RedirectToFirstRecordPanelAllowedInSlider';
import {RedirectCreationFormPanelToPopup} from '../guards/RedirectCreationFormPanelToPopup';

// panelWithFlap route need to be before the panel route because router will match the first route that matches the path
const panelPaths = [AbsolutePaths.panelWithFlap, AbsolutePaths.panel];

export const firstLevelRoutes: RouteObject[] = [
    {
        path: UnreachablePaths.workspace,
        element: <RedirectToFirstPanel />,
    },
    {
        element: <WorkspacesNavigationMenu />,
        children: [
            ...panelPaths.map(panelPath => ({
                path: panelPath,
                element: (
                    <RedirectToPreviousPanel>
                        <Panel />
                    </RedirectToPreviousPanel>
                ),
            })),
        ],
    },
    {
        path: '*',
        element: <RedirectToFirstWorkspace />,
    },
];

// recordWherePanelWithFlap route need to be before the recordWherePanel because router will match the first route that matches the path
const recordWherePanelPaths = [UnreachablePaths.recordWherePanelWithFlap, UnreachablePaths.recordWherePanel];

export const nextLevelRoutes: RouteObject[] = [
    {
        path: UnreachablePaths.record,
        element: <RedirectToFirstRecordPanel />,
    },
    ...recordWherePanelPaths.map(recordWherePanelPath => ({
        path: recordWherePanelPath,
        element: (
            <RedirectToPreviousPanel>
                <RedirectToFirstRecordPanelAllowedInSlider>
                    <RedirectCreationFormPanelToPopup>
                        <PanelContainer>
                            <Panel />
                        </PanelContainer>
                    </RedirectCreationFormPanelToPopup>
                </RedirectToFirstRecordPanelAllowedInSlider>
            </RedirectToPreviousPanel>
        ),
    })),
];
