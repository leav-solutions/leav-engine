import {BellOutlined, MenuOutlined, SelectOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Menu} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import UserMenu from './UserMenu';

interface ITopBarProps {
    sideBarVisible: boolean;
    userPanelVisible: boolean;
    toggleSidebarVisible: () => void;
    toggleUserPanelVisible: () => void;
}

const WrapperUserMenu = styled.div`
    width: 6rem;
`;

const MenuItemRight = styled(Menu.Item)`
    float: right;
`;

function TopBar({
    sideBarVisible,
    userPanelVisible,
    toggleSidebarVisible,
    toggleUserPanelVisible
}: ITopBarProps): JSX.Element {
    const {t} = useTranslation();

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const {data: activeLib} = useQuery(getActiveLibrary);
    const {activeLibName} = activeLib ?? {};

    const triggerMenuKey = 'trigger-side-menu';
    const userPanelKey = 'trigger-user-panel';

    useEffect(() => {
        setSelectedKeys(
            keys =>
                !sideBarVisible
                    ? keys.filter(key => key !== triggerMenuKey) // remove
                    : [...keys, triggerMenuKey] // add
        );
        setSelectedKeys(
            keys =>
                !userPanelVisible
                    ? keys.filter(key => key !== userPanelKey) // remove
                    : [...keys, userPanelKey] // add
        );
    }, [sideBarVisible, userPanelVisible, setSelectedKeys]);

    const handleSideMenuClick = () => {
        toggleSidebarVisible();
    };

    const handleUserPanelClick = () => {
        toggleUserPanelVisible();
    };

    return (
        <Menu mode="horizontal" theme="dark" selectedKeys={selectedKeys}>
            <Menu.Item key={triggerMenuKey} onClick={handleSideMenuClick}>
                <MenuOutlined />
            </Menu.Item>
            <Menu.SubMenu
                key="lib-name"
                title={activeLibName !== '' ? activeLibName : t('menu.app_name')}
            ></Menu.SubMenu>

            <MenuItemRight key={userPanelKey} onClick={handleUserPanelClick}>
                <WrapperUserMenu>
                    <UserMenu />
                </WrapperUserMenu>
            </MenuItemRight>

            <MenuItemRight key="event" icon={<BellOutlined />}>
                {t('menu.events')}
            </MenuItemRight>
            <MenuItemRight key="shortcuts" icon={<SelectOutlined />}>
                {t('menu.shortcuts')}
            </MenuItemRight>
        </Menu>
    );
}

export default TopBar;
