import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitSideMenu} from 'aristid-ds';
import {type ComponentProps, type FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
import {faBorderAll} from '@fortawesome/free-solid-svg-icons';
import {useLocation, useNavigate} from 'react-router-dom';

interface INavigationMenuProps {
    menuOpen: boolean;
    handleToggleMenu: (open: boolean) => void;
    items: ComponentProps<typeof KitSideMenu>['items'];
}

export const NavigationMenu: FunctionComponent<INavigationMenuProps> = ({menuOpen, items, handleToggleMenu}) => {
    const {t} = useTranslation();
    const navigation = useNavigate();
    const {pathname} = useLocation();

    const onOpenMenu = () => {
        handleToggleMenu(true);
    };

    return (
        <KitSideMenu
            open={menuOpen}
            onOpenChanged={handleToggleMenu}
            defaultActiveItemKey={pathname}
            items={items}
        />
    );
};
