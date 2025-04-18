// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSideMenu} from 'aristid-ds';
import {useContext, type FunctionComponent} from 'react';
import {ApplicationContext} from '../workspace-context/ApplicationProvider';

interface INavigationMenuProps {
    menuOpen: boolean;
    handleToggleMenu: (open: boolean) => void;
}

export const NavigationMenu: FunctionComponent<INavigationMenuProps> = ({menuOpen, handleToggleMenu}) => {
    const {application, currentWorkspace} = useContext(ApplicationContext);

    const items = application.workspaces.map(workspace => ({
        key: workspace.id,
        title: workspace.title,
        icon: workspace.icon
    }));

    return (
        <KitSideMenu
            open={menuOpen}
            onOpenChanged={handleToggleMenu}
            defaultActiveItemKey={currentWorkspace?.id}
            items={items}
        />
    );
};
