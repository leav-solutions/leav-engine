// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CarryOutOutlined, DoubleRightOutlined, ExclamationCircleOutlined, LogoutOutlined} from '@ant-design/icons';
import {Drawer, Menu} from 'antd';
import AvailableSoon from 'components/shared/AvailableSoon';
import useAuth from 'hooks/useAuth';
import React from 'react';
import {useTranslation} from 'react-i18next';
import LangSwitcher from './LangSwitcher';

interface IUserPanelProps {
    userPanelVisible: boolean;
    hideUserPanel: () => void;
}

function UserPanel({userPanelVisible, hideUserPanel}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {logout} = useAuth();

    const _handleLogout = () => {
        logout();
    };

    return (
        <Drawer
            visible={userPanelVisible}
            onClose={hideUserPanel}
            placement="right"
            closable={false}
            getContainer={false}
            bodyStyle={{padding: 0}}
        >
            <Menu
                style={{
                    height: '100%'
                }}
                mode="inline"
            >
                <Menu.Item disabled key="tasks">
                    <CarryOutOutlined />
                    {t('menu.user_menu.tasks')}
                    <AvailableSoon />
                </Menu.Item>
                <Menu.Item disabled key="shortcuts">
                    <DoubleRightOutlined />
                    {t('menu.user_menu.shortcuts')}
                    <AvailableSoon />
                </Menu.Item>
                <Menu.Item disabled key="events">
                    <ExclamationCircleOutlined />
                    {t('menu.user_menu.events')}
                    <AvailableSoon />
                </Menu.Item>

                <Menu.Item key="lang-switcher">
                    <LangSwitcher />
                </Menu.Item>

                <Menu.Item onClick={_handleLogout} key="logout">
                    <LogoutOutlined />
                    {t('menu.user_menu.logout')}
                </Menu.Item>
            </Menu>
        </Drawer>
    );
}

export default UserPanel;
