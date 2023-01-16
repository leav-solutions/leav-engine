// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FlagOutlined, LogoutOutlined} from '@ant-design/icons';
import {Drawer, Menu} from 'antd';
import useAuth from 'hooks/useAuth/useAuth';
import React from 'react';
import {useTranslation} from 'react-i18next';
import LangSwitcher from './LangSwitcher';

interface IUserPanelProps {
    isVisible: boolean;
    onClose: () => void;
}

function UserPanel({isVisible, onClose}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {logout} = useAuth();
    const _handleLogout = () => {
        logout();
    };

    const menuItems = [
        {
            key: 'lang-switcher',
            icon: <FlagOutlined />,
            label: <LangSwitcher />
        },
        {
            key: 'logout',
            label: t('logout'),
            icon: <LogoutOutlined />,
            onClick: _handleLogout
        }
    ];

    return (
        <Drawer
            closeIcon={false}
            closable={false}
            placement="right"
            onClose={onClose}
            open={isVisible}
            bodyStyle={{padding: 0}}
        >
            <Menu
                style={{
                    height: '100%'
                }}
                mode="inline"
                items={menuItems}
            />
        </Drawer>
    );
}

export default UserPanel;
