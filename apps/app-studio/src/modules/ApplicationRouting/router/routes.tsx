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

export const firstLevelRoutes: RouteObject[] = [
    {
        path: UnreachablePaths.workspace,
        element: <RedirectToFirstPanel />,
    },
    {
        element: <WorkspacesNavigationMenu />,
        children: [
            {
                path: AbsolutePaths.panel,
                element: (
                    <RedirectToPreviousPanel>
                        <Panel />
                    </RedirectToPreviousPanel>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <RedirectToFirstWorkspace />,
    },
];

export const nextLevelRoutes: RouteObject[] = [
    {
        path: UnreachablePaths.record,
        element: <RedirectToFirstRecordPanel />,
    },
    {
        path: UnreachablePaths.recordWherePanel,
        element: (
            <RedirectToPreviousPanel>
                <PanelContainer>
                    <Panel />
                </PanelContainer>
            </RedirectToPreviousPanel>
        ),
    },
];
