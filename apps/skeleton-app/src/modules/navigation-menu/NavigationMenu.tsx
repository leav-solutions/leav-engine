// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSideMenu} from 'aristid-ds';
import {useMemo, type FunctionComponent} from 'react';
import {useNavigate, generatePath} from 'react-router-dom';
import {IWorkspace} from '../ApplicationRouting/types';
import {routes} from '../ApplicationRouting/routes';

interface INavigationMenuProps {
    menuOpen: boolean;
    handleToggleMenu: (open: boolean) => void;
    workspaces: IWorkspace[];
    activeWorkspaceId: string;
}

export const NavigationMenu: FunctionComponent<INavigationMenuProps> = ({
    menuOpen,
    handleToggleMenu,
    workspaces,
    activeWorkspaceId
}) => {
    const navigate = useNavigate();

    const items = useMemo(
        () =>
            workspaces.map(workspace => ({
                key: workspace.id,
                title: workspace.title,
                icon: workspace.icon,
                onClick: () => {
                    navigate(generatePath(routes.panel, {panelId: workspace.panels?.[0]?.id ?? ''}));
                }
            })),
        [workspaces]
    );

    return (
        <KitSideMenu
            open={menuOpen}
            onOpenChanged={handleToggleMenu}
            defaultActiveItemKey={activeWorkspaceId ?? workspaces?.[0]?.id}
            items={items}
        />
    );
};
