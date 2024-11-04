// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LEAVEngineIcon from 'components/shared/LEAVEngineIcon';
import useAuth from 'hooks/useAuth';
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
    const {logout} = useAuth();

    const _handleLogout = () => {
        logout();
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
            <a href="https://leav-engine.com" target="_blank">
                <LEAVEngineIcon height="30px" style={{position: 'absolute', bottom: '15px', width: '100%'}} />
            </a>
        </Sidebar>
    );
}

export default UserPanel;
