// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CarryOutOutlined, DoubleRightOutlined, ExclamationCircleOutlined, LogoutOutlined} from '@ant-design/icons';
import {useAuthToken} from '@leav/utils';
import {Drawer, Menu} from 'antd';
import AvailableSoon from 'components/shared/AvailableSoon';
import React from 'react';
import {useTranslation} from 'react-i18next';
import LangSwitcher from './LangSwitcher';

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
                style={{
                    height: '100%'
                }}
                mode="inline"
            >
                <Menu.Item disabled>
                    <CarryOutOutlined />
                    {t('menu.user_menu.tasks')}
                    <AvailableSoon />
                </Menu.Item>
                <Menu.Item disabled>
                    <DoubleRightOutlined />
                    {t('menu.user_menu.shortcuts')}
                    <AvailableSoon />
                </Menu.Item>
                <Menu.Item disabled>
                    <ExclamationCircleOutlined />
                    {t('menu.user_menu.events')}
                    <AvailableSoon />
                </Menu.Item>

                <Menu.Item>
                    <LangSwitcher />
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
