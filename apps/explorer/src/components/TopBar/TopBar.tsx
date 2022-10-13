// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Badge, Button, Tooltip} from 'antd';
import ApplicationSwitcher from 'components/ApplicationSwitcher';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import React, {useState} from 'react';
import styled from 'styled-components';
import {default as themingVar, default as themingVars} from '../../themingVar';
import HeaderInfo from '../HeaderInfo';
import UserMenu from './UserMenu';
import {BellOutlined} from '@ant-design/icons';

interface ITopBarProps {
    userPanelVisible: boolean;
    notifsPanelVisible: boolean;
    toggleUserPanelVisible: () => void;
    toggleNotifsPanelVisible: () => void;
    nbNotifs: number;
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

const WrapperHeaderInfo = styled.div`
    width: 100%;
    display: flex;
    justify-content: start;
    align-items: center;
`;

interface IMenuItemProps {
    isActive?: boolean;
}

const InfoButton = styled(Button)`
    && {
        &,
        :hover,
        :active,
        :focus {
            border: none;
            color: #fff;
        }
        font-size: 1.5em;
    }
`;

function TopBar({
    userPanelVisible,
    notifsPanelVisible,
    toggleUserPanelVisible,
    toggleNotifsPanelVisible,
    nbNotifs
}: ITopBarProps): JSX.Element {
    const userPanelKey = 'trigger-user-panel';
    const notifsPanelKey = 'trigger-notifs-panel';

    const handleUserPanelClick = () => {
        toggleUserPanelVisible();
    };

    const handleNotifsPanelClick = () => {
        toggleNotifsPanelVisible();
    };

    return (
        <Wrapper>
            <WrapperHeaderInfo data-testid="WrapperHeaderInfo" key="lib-name">
                <HeaderInfo data-testid="HeaderInfo" />
            </WrapperHeaderInfo>
            <ApplicationSwitcher data-testid="ApplicationSwitcher" />
            <Badge size="small" count={nbNotifs} offset={[-10, 15]}>
                <InfoButton
                    data-testid="InfoButton"
                    key={notifsPanelKey}
                    name="infos"
                    ghost
                    shape="circle"
                    size="large"
                    icon={<BellOutlined style={{fontSize: '1.5em'}} />}
                    aria-label="infos"
                    onClick={handleNotifsPanelClick}
                />
            </Badge>
            <MenuItemUser
                data-testid="MenuItemUser"
                key={userPanelKey}
                onClick={handleUserPanelClick}
                isActive={userPanelVisible}
            >
                <UserMenu data-testid="UserMenu" />
            </MenuItemUser>
        </Wrapper>
    );
}

export default TopBar;
