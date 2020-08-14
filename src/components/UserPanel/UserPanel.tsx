import {LogoutOutlined} from '@ant-design/icons';
import {Drawer, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface IUserPanelProps {
    userPanelVisible: boolean;
    hideUserPanel: () => void;
}

function UserPanel({userPanelVisible, hideUserPanel}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();

    return (
        <Drawer
            visible={userPanelVisible}
            onClose={hideUserPanel}
            placement="right"
            closable={false}
            getContainer={false}
            style={{position: 'absolute'}}
            bodyStyle={{padding: 0}}
        >
            <Menu theme="dark" style={{height: '100%'}} mode="inline">
                <Menu.Item>{t('menu.user_menu.profil')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.tasks')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.shortcuts')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.events')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.admin')}</Menu.Item>
                <Menu.Item>{t('menu.user_menu.leav_engine')}</Menu.Item>
                <Menu.Item>
                    <LogoutOutlined />
                    {t('menu.user_menu.logout')}
                </Menu.Item>
            </Menu>
        </Drawer>
    );
}

export default UserPanel;
