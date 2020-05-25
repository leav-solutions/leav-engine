import React from 'react';
import {useTranslation} from 'react-i18next';
import {Menu} from 'semantic-ui-react';
import UserMenu from './UserMenu';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
}

function TopBar({toggleSidebarVisible}: ITopBarProps): JSX.Element {
    const {t} = useTranslation();

    return (
        <Menu inverted style={{borderRadius: 0, margin: 0}}>
            <Menu.Menu>
                <Menu.Item name="toggle-sidebar" content="" icon="grid layout" onClick={toggleSidebarVisible} />
                <Menu.Item name="Name" content={t('menu.app_name')} />
            </Menu.Menu>

            <Menu.Menu position="right">
                <Menu.Item name="shortcuts" content={t('menu.shortcuts')} icon="share square" />
                <Menu.Item name="events" content={t('menu.events')} icon="bell" />
            </Menu.Menu>

            <Menu.Menu>
                <UserMenu />
            </Menu.Menu>
        </Menu>
    );
}

export default TopBar;
