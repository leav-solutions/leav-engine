// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {BellOutlined, MenuOutlined, SelectOutlined} from '@ant-design/icons';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVars from '../../themingVar';
import HeaderNotification from '../HeaderNotification';
import UserMenu from './UserMenu';
interface ITopBarProps {
    sideBarVisible: boolean;
    userPanelVisible: boolean;
    toggleSidebarVisible: () => void;
    toggleUserPanelVisible: () => void;
}

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 5rem;
    grid-template-columns: 5rem 1fr repeat(2, 8rem) 10rem;
    align-items: start;
    justify-items: start;
    justify-content: start;

    color: white;
    background: transparent linear-gradient(85deg, #0f2027 0%, #203a43 52%, #2c5364 100%) 0% 0% no-repeat padding-box;
`;
interface IMenuItemProps {
    isActive?: boolean;
}
const MenuItem = styled.div<IMenuItemProps>`
    display: flex;
    justify-content: space-around;
    align-items: center;
    transition: 275ms ease-out;
    padding: 0 1rem;
    background: ${props => (props.isActive ? themingVars['@primary-color'] : 'none')};

    & > * {
        margin: 0 0.5rem;
    }

    &:hover {
        background: ${themingVars['@primary-color']};
    }
`;

const MenuItemUser = styled(MenuItem)`
    justify-self: end;
`;

const WrapperHeaderNotification = styled.div`
    width: 100%;
    display: flex;
    justify-content: start;
    align-items: center;
`;

function TopBar({
    sideBarVisible,
    userPanelVisible,
    toggleSidebarVisible,
    toggleUserPanelVisible
}: ITopBarProps): JSX.Element {
    const {t} = useTranslation();

    const triggerMenuKey = 'trigger-side-menu';
    const userPanelKey = 'trigger-user-panel';

    const handleSideMenuClick = () => {
        toggleSidebarVisible();
    };

    const handleUserPanelClick = () => {
        toggleUserPanelVisible();
    };

    return (
        <Wrapper>
            <MenuItem key={triggerMenuKey} onClick={handleSideMenuClick} isActive={sideBarVisible}>
                <MenuOutlined />
            </MenuItem>

            <WrapperHeaderNotification key="lib-name">
                <HeaderNotification />
            </WrapperHeaderNotification>

            <MenuItem key="shortcuts">
                <SelectOutlined />
                {t('menu.shortcuts')}
            </MenuItem>

            <MenuItem key="event">
                <BellOutlined />
                {t('menu.events')}
            </MenuItem>

            <MenuItemUser key={userPanelKey} onClick={handleUserPanelClick} isActive={userPanelVisible}>
                <UserMenu />
            </MenuItemUser>
        </Wrapper>
    );
}

export default TopBar;
