// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LogoutOutlined, SettingOutlined} from '@ant-design/icons';
import {Drawer, Menu} from 'antd';
import useAuthToken from 'hooks/useAuthToken';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';

interface IUserPanelProps {
    userPanelVisible: boolean;
    hideUserPanel: () => void;
}

function UserPanel({userPanelVisible, hideUserPanel}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {deleteToken} = useAuthToken();

    const _handleLogout = () => {
        deleteToken();
        window.location.replace('/');
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
                theme="dark"
                style={{
                    height: '100%'
                }}
                mode="inline"
            >
                <Menu.Item>{t('menu.user_menu.profil')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.tasks')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.shortcuts')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.events')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.admin')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.leav_engine')}</Menu.Item>

                <Menu.Item icon={<SettingOutlined />} onClick={hideUserPanel}>
                    <NavLink to="/setting">{t('sidebar.setting')}</NavLink>
                </Menu.Item>

                <Menu.Item onClick={_handleLogout}>
                    <LogoutOutlined />
                    {t('menu.user_menu.logout')}
                </Menu.Item>
            </Menu>
        </Drawer>
    );
}

export default UserPanel;
