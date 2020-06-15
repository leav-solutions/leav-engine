import {useQuery} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Divider, Icon, Menu, Sidebar} from 'semantic-ui-react';
import {getActiveLibrary} from '../../queries/cache/activeLibrary/getActiveLibraryQuery';
import SideBarLibraryList from './SideBarLibraryList';

interface ISideBarMenuProps {
    visible: boolean;
    hide: () => void;
}

function SideBarMenu({visible, hide}: ISideBarMenuProps): JSX.Element {
    const {t} = useTranslation();

    const {data: activeLib} = useQuery(getActiveLibrary);
    const {activeLibId, activeLibQueryName, activeLibName, activeLibFilterName} = activeLib ?? {};

    const checkActive = (match: any, location: any) => {
        //some additional logic to verify you are in the home URI
        if (!location) return false;
        const {pathname} = location;
        return pathname === '/';
    };

    return (
        <Sidebar
            as={Menu}
            inverted
            vertical
            animation="overlay"
            direction="left"
            visible={visible}
            onHide={hide}
            width="wide"
        >
            <Menu.Item header content={t('sidebar.shortcuts')} />
            {activeLibId && (
                <NavLink
                    to={`/library/items/${activeLibId}/${activeLibQueryName}/${activeLibFilterName}`}
                    onClick={hide}
                    strict
                    activeClassName="nav-link-active"
                    isActive={checkActive}
                >
                    <Menu.Item as="span">
                        <Icon name="database" />
                        {activeLibName}
                    </Menu.Item>
                </NavLink>
            )}

            <NavLink to="/library/list/" onClick={hide} activeClassName="nav-link-active">
                <Menu.Item as="span">
                    <Icon name="list ul" />
                    {t('sidebar.lib_list')}
                </Menu.Item>
            </NavLink>

            <NavLink to="/setting" onClick={hide} activeClassName="nav-link-active">
                <Menu.Item as="span">
                    <Icon name="setting" />
                    {t('sidebar.setting')}
                </Menu.Item>
            </NavLink>

            <Divider />

            <Menu.Item header>{t('sidebar.libraries')}</Menu.Item>
            <SideBarLibraryList hide={hide} />
        </Sidebar>
    );
}

export default SideBarMenu;
