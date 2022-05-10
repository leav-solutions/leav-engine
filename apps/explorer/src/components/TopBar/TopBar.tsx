// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApplicationSwitcher from 'components/ApplicationSwitcher';
import React from 'react';
import styled from 'styled-components';
import {default as themingVar, default as themingVars} from '../../themingVar';
import HeaderNotification from '../HeaderNotification';
import UserMenu from './UserMenu';

interface ITopBarProps {
    userPanelVisible: boolean;
    toggleUserPanelVisible: () => void;
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: ${themingVar['@leav-header-height']};

    color: white;
    background: transparent linear-gradient(85deg, #0f2027 0%, #203a43 52%, #2c5364 100%) 0% 0% no-repeat padding-box;
`;

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

interface IMenuItemProps {
    isActive?: boolean;
}

function TopBar({userPanelVisible, toggleUserPanelVisible}: ITopBarProps): JSX.Element {
    const userPanelKey = 'trigger-user-panel';

    const handleUserPanelClick = () => {
        toggleUserPanelVisible();
    };

    return (
        <Wrapper>
            <WrapperHeaderNotification key="lib-name">
                <HeaderNotification />
            </WrapperHeaderNotification>
            <ApplicationSwitcher />
            <MenuItemUser key={userPanelKey} onClick={handleUserPanelClick} isActive={userPanelVisible}>
                <UserMenu />
            </MenuItemUser>
        </Wrapper>
    );
}

export default TopBar;
