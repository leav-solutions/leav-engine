// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';

export const SIDE_MENU_STATE_KEY = 'sideMenuOpen';

const getLocalStorageMenuState = (): boolean => {
    const menuOpen = localStorage.getItem(SIDE_MENU_STATE_KEY);
    if (menuOpen === null) {
        return true;
    }
    return menuOpen === 'true';
};

export const useWorkspacesNavigationMenu = () => {
    const [isMenuOpen, setMenuOpen] = useState(getLocalStorageMenuState());

    const handleToggleMenu = (open: boolean): void => {
        localStorage.setItem(SIDE_MENU_STATE_KEY, open.toString());
        setMenuOpen(open);
    };

    return {isMenuOpen, handleToggleMenu};
};
