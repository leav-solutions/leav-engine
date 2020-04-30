import React from 'react';
import {NavLink} from 'react-router-dom';
import {Icon, Menu, Sidebar} from 'semantic-ui-react';

interface ISideBarMenuProps {
    visible: boolean;
    hide: () => void;
}

function SideBarMenu({visible, hide}: ISideBarMenuProps): JSX.Element {
    const checkActive = (match: any, location: any) => {
        //some additional logic to verify you are in the home URI
        if (!location) return false;
        const {pathname} = location;
        return pathname === '/';
    };

    return (
        <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            animation="overlay"
            direction="left"
            visible={visible}
            onHide={hide}
            width="thin"
        >
            <Menu.Item as="div" onClick={hide}>
                <Icon name="close" />
                Close Sidebar
            </Menu.Item>

            <NavLink to="/" onClick={hide} strict activeClassName="nav-link-active" isActive={checkActive}>
                <Menu.Item as="span">
                    <Icon name="home" />
                    Home
                </Menu.Item>
            </NavLink>

            <NavLink to="/LibrariesList" onClick={hide} activeClassName="nav-link-active">
                <Menu.Item as="span">
                    <Icon name="list ul" />
                    Library List
                </Menu.Item>
            </NavLink>

            <NavLink to="/setting" onClick={hide} activeClassName="nav-link-active">
                <Menu.Item as="span">
                    <Icon name="setting" />
                    Setting
                </Menu.Item>
            </NavLink>
        </Sidebar>
    );
}

export default SideBarMenu;
