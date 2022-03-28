// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useAuthToken} from '@leav/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon, Menu, Sidebar} from 'semantic-ui-react';
import LangSwitcher from './LangSwitcher';

interface IUserPanelProps {
    visible: boolean;
    onHide: () => void;
}

function UserPanel({visible, onHide}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();
    const {deleteToken} = useAuthToken();

    const _handleLogout = () => {
        deleteToken();
        window.location.replace('/');
    };

    return (
        <Sidebar
            as={Menu}
            animation="overlay"
            onHide={onHide}
            vertical
            visible={visible}
            direction="right"
            width="wide"
        >
            <Menu.Item onClick={_handleLogout} role="menuitem">
                <span>
                    <Icon name="log out" />
                    {t('admin.logout')}
                </span>
            </Menu.Item>
            <Menu.Item role="menuitem">
                <LangSwitcher />
            </Menu.Item>
        </Sidebar>
    );
}

export default UserPanel;
