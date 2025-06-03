// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSideMenu} from 'aristid-ds';
import {useMemo, type FunctionComponent, ComponentProps, useContext} from 'react';
import {useNavigate, generatePath, useParams, Outlet} from 'react-router-dom';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '_ui/contexts';
import {IApplication} from '../types';
import {routes} from '../routes';
import {useApplicationMatching} from '../useApplicationMatching';
import {useWorkspacesNavigationMenu} from './useWorkspacesNavigationMenu';

interface IWorkspacesNavigationMenuProps {
    application: IApplication;
}

export const WorkspacesNavigationMenu: FunctionComponent<IWorkspacesNavigationMenuProps> = ({application}) => {
    const {panelId} = useParams();
    const {isMenuOpen, handleToggleMenu} = useWorkspacesNavigationMenu();

    const applicationMatching = useApplicationMatching(application.workspaces, panelId);
    const navigate = useNavigate();
    const {lang} = useContext(LangContext);

    const items: ComponentProps<typeof KitSideMenu>['items'] = useMemo(
        () =>
            application.workspaces.map(workspace => ({
                key: workspace.id,
                title: localizedTranslation(workspace.title, lang),
                icon: workspace.icon,
                onClick: () => {
                    navigate(generatePath(routes.panel, {panelId: workspace.panels?.[0]?.id ?? ''}));
                }
            })),
        [application.workspaces, lang]
    );

    return (
        <>
            <KitSideMenu
                open={isMenuOpen}
                onOpenChanged={handleToggleMenu}
                defaultActiveItemKey={applicationMatching.currentWorkspace?.id}
                items={items}
            />
            <Outlet context={applicationMatching} />
        </>
    );
};
