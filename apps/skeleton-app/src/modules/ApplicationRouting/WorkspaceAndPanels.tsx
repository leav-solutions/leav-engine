// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {generatePath, Outlet, useLocation, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import type {IWorkspace, Panel} from './types';
import {routes} from './routes';
import {NavigationMenu} from '../../modules/navigation-menu/NavigationMenu';
import {PageLayout} from '../../modules/layout/PageLayout';
import {useNavigationMenu} from '../../modules/navigation-menu/useNavigationMenu';
import {Page} from '../../modules/layout/Page';
import {useWorkspacesAndPanels} from '../../modules/use-workspaces-and-panels/useWorkspacesAndPanels';

export const WorkspaceAndPanels: FunctionComponent = () => {
    const {panelId} = useParams();
    const workspaces = useOutletContext<IWorkspace[]>();
    const {search} = useLocation();
    const navigate = useNavigate();
    const {isMenuOpen, handleToggleMenu} = useNavigationMenu();
    const {currentPanel, currentWorkspace, currentParentTuple} = useWorkspacesAndPanels(workspaces, panelId);

    const tabItems =
        currentParentTuple !== undefined && 'children' in currentParentTuple[0]
            ? currentParentTuple[0].children.map(panel => ({
                  key: panel.id,
                  label: panel.id,
                  onClick: () => {
                      navigate(generatePath(routes.panel, {panelId: panel.id}) + search);
                  }
              }))
            : null;

    return (
        <>
            <NavigationMenu
                menuOpen={isMenuOpen}
                handleToggleMenu={handleToggleMenu}
                workspaces={workspaces}
                activeWorkspaceId={currentWorkspace.id}
            />
            <PageLayout>
                <Page title={currentPanel?.id} tabs={tabItems} defaultActiveTabKey={currentPanel?.id}>
                    <Outlet
                        context={
                            {currentPanel, currentWorkspace} satisfies {
                                currentPanel: Panel;
                                currentWorkspace: IWorkspace;
                            }
                        }
                    />
                </Page>
            </PageLayout>
        </>
    );
};
