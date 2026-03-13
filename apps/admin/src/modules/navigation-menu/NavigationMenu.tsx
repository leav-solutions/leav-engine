// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSideMenu} from 'aristid-ds';
import {useGetNavigationMenuItems} from './useGetNavigationMenuItems';
import {useLocation, useNavigate} from 'react-router-dom';

interface INavigationMenuProps {
    isOpen: boolean;
    onOpenChanged: (isOpen: boolean) => void;
}

export const NavigationMenu = ({isOpen, onOpenChanged}: INavigationMenuProps) => {
    const menuItems = useGetNavigationMenuItems();
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const activeItemKey = pathname.split('/').filter(Boolean)[0] ?? '';

    const _handleMenuItemClick = (itemKey: string) => {
        navigate(`/${itemKey}`);
    };

    return (
        <KitSideMenu
            open={isOpen}
            items={menuItems}
            onOpenChanged={onOpenChanged}
            onMenuClick={_handleMenuItemClick}
            defaultActiveItemKey={activeItemKey}
        />
    );
};
