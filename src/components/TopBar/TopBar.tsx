import {useQuery} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Menu} from 'semantic-ui-react';
import styled from 'styled-components';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import UserMenu from './UserMenu';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
    toggleUserPanelVisible: () => void;
}

const CustomMenu = styled(Menu)`
    && {
        border-radius: 0;
        margin: 0;
        height: 3.5rem;
    }
`;

const WrapperUserMenu = styled.div`
    width: 6rem;
`;

function TopBar({toggleSidebarVisible, toggleUserPanelVisible}: ITopBarProps): JSX.Element {
    const {t} = useTranslation();

    const {data: activeLib} = useQuery(getActiveLibrary);
    const {activeLibName} = activeLib ?? {};

    return (
        <CustomMenu inverted size="huge">
            <Menu.Menu>
                <Menu.Item name="toggle-sidebar" content="" icon="sidebar" onClick={toggleSidebarVisible} />
                <Menu.Item name="Name" content={activeLibName !== '' ? activeLibName : t('menu.app_name')} />
            </Menu.Menu>

            <Menu.Menu position="right">
                <Menu.Item name="shortcuts" content={t('menu.shortcuts')} icon="share square" />
                <Menu.Item name="events" content={t('menu.events')} icon="bell" />
                <Menu.Item onClick={toggleUserPanelVisible}>
                    <WrapperUserMenu>
                        <UserMenu />
                    </WrapperUserMenu>
                </Menu.Item>
            </Menu.Menu>
        </CustomMenu>
    );
}

export default TopBar;
