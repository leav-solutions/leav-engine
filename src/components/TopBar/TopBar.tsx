import {useQuery} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Menu} from 'semantic-ui-react';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import UserMenu from './UserMenu';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
    toggleUserPanelVisible: () => void;
}

function TopBar({toggleSidebarVisible, toggleUserPanelVisible}: ITopBarProps): JSX.Element {
    const {t} = useTranslation();

    const {data: activeLib} = useQuery(getActiveLibrary);
    const {activeLibName} = activeLib ?? {};

    return (
        <Menu inverted size="huge" style={{borderRadius: 0, margin: 0}}>
            <Menu.Menu>
                <Menu.Item name="toggle-sidebar" content="" icon="grid layout" onClick={toggleSidebarVisible} />
                <Menu.Item name="Name" content={activeLibName !== '' ? activeLibName : t('menu.app_name')} />
            </Menu.Menu>

            <Menu.Menu position="right">
                <Menu.Item name="shortcuts" content={t('menu.shortcuts')} icon="share square" />
                <Menu.Item name="events" content={t('menu.events')} icon="bell" />
            </Menu.Menu>

            <Menu.Menu>
                <div onClick={toggleUserPanelVisible}>
                    <UserMenu />
                </div>
            </Menu.Menu>
        </Menu>
    );
}

export default TopBar;
