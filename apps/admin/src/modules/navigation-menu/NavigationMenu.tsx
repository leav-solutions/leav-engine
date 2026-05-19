import {KitSideMenu} from 'aristid-ds';
import {useGetNavigationMenuItems} from './useGetNavigationMenuItems';
import {useActiveMenuItemKey} from './useActiveMenuItemKey';
import {useNavigate} from 'react-router-dom';

interface INavigationMenuProps {
    isOpen: boolean;
    onOpenChanged: (isOpen: boolean) => void;
}

export const NavigationMenu = ({isOpen, onOpenChanged}: INavigationMenuProps) => {
    const menuItems = useGetNavigationMenuItems();
    const navigate = useNavigate();
    const activeItemKey = useActiveMenuItemKey();

    const _handleMenuItemClick = (itemKey: string) => {
        navigate(`/${itemKey}`);
    };

    return (
        <KitSideMenu
            open={isOpen}
            items={menuItems}
            onOpenChanged={onOpenChanged}
            onMenuClick={_handleMenuItemClick}
            activeItemKey={activeItemKey}
        />
    );
};
