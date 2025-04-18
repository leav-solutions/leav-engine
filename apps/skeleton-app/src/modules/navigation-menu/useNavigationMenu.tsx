import { useState } from 'react';

interface UseNavigationMenu {
    isMenuOpen: boolean;
    handleToggleMenu: (open: boolean) => void;
}

export const SIDE_MENU_STATE_KEY = 'sideMenuOpen';

const getLocalStorageMenuState = () => {
    const menuOpen = localStorage.getItem(SIDE_MENU_STATE_KEY);
    if (menuOpen === null) {
        return true;
    }
    return menuOpen === 'true';
};

export const useNavigationMenu = (): UseNavigationMenu => {
    const [isMenuOpen, setMenuOpen] = useState(getLocalStorageMenuState());

    const handleToggleMenu = (open: boolean) => {
        localStorage.setItem(SIDE_MENU_STATE_KEY, open.toString());
        setMenuOpen(open);
    };

    return { isMenuOpen, handleToggleMenu };
};
