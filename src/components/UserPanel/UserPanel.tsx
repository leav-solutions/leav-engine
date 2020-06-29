import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon, Menu, Sidebar} from 'semantic-ui-react';

interface IUserPanelProps {
    userPanelVisible: boolean;
    hideUserPanel: () => void;
}

function UserPanel({userPanelVisible, hideUserPanel}: IUserPanelProps): JSX.Element {
    const {t} = useTranslation();

    return (
        <Sidebar
            as={Menu}
            inverted
            vertical
            animation="overlay"
            direction="right"
            visible={userPanelVisible}
            onHide={hideUserPanel}
            width="wide"
        >
            <Menu.Item>{t('menu.user_menu.profil')}</Menu.Item>
            <Menu.Item>{t('menu.user_menu.tasks')}</Menu.Item>
            <Menu.Item>{t('menu.user_menu.shortcuts')}</Menu.Item>
            <Menu.Item>{t('menu.user_menu.events')}</Menu.Item>
            <Menu.Item>{t('menu.user_menu.admin')}</Menu.Item>
            <Menu.Item>{t('menu.user_menu.leav_engine')}</Menu.Item>
            <Menu.Item>
                <Icon name="log out" />
                {t('menu.user_menu.logout')}
            </Menu.Item>
        </Sidebar>
    );
}

export default UserPanel;
