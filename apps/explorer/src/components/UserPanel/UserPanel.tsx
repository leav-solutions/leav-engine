// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LogoutOutlined, SettingOutlined} from '@ant-design/icons';
import {Drawer, Menu} from 'antd';
import useAuthToken from 'hooks/useAuthToken';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Settings from '../Settings';

interface IUserPanelProps {
    userPanelVisible: boolean;
    hideUserPanel: () => void;
}

function UserPanel({userPanelVisible, hideUserPanel}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {deleteToken} = useAuthToken();

    const [openSettings, setOpenSettings] = useState(false);

    const _handleLogout = () => {
        deleteToken();
        window.location.replace('/');
    };

    const _handleCloseSettings = () => {
        setOpenSettings(false);
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
                <Menu.Item>{t('menu.user_menu.profil')} (Coming soon)</Menu.Item>
                <Menu.Item>{t('menu.user_menu.tasks')} (Coming soon)</Menu.Item>
                <Menu.Item>{t('menu.user_menu.shortcuts')} (Coming soon)</Menu.Item>
                <Menu.Item>{t('menu.user_menu.events')} (Coming soon)</Menu.Item>
                <Menu.Item>{t('menu.user_menu.admin')} (Coming soon)</Menu.Item>
                <Menu.Item>{t('menu.user_menu.leav_engine')} (Coming soon)</Menu.Item>

                <Menu.Item icon={<SettingOutlined />} onClick={() => setOpenSettings(true)}>
                    {t('sidebar.setting')}
                </Menu.Item>

                <Menu.Item onClick={_handleLogout}>
                    <LogoutOutlined />
                    {t('menu.user_menu.logout')}
                </Menu.Item>
            </Menu>
            {openSettings && <Settings visible={openSettings} onClose={_handleCloseSettings} />}
        </Drawer>
    );
}

export default UserPanel;
