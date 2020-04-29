import React from 'react';
import {Link} from 'react-router-dom';
import {Icon, Menu, Sidebar} from 'semantic-ui-react';

interface ISideBarMenuProps {
    visible: boolean;
}

function SideBarMenu({visible}: ISideBarMenuProps): JSX.Element {
    return (
        <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            animation="push"
            direction="left"
            visible={visible}
            width="thin"
        >
            <Link to="/">
                <Menu.Item as="span">
                    <Icon name="home" />
                    Home
                </Menu.Item>
            </Link>
            <Link to="/setting">
                <Menu.Item as="span">
                    <Icon name="setting" />
                    Setting
                </Menu.Item>
            </Link>
        </Sidebar>
    );
}

export default SideBarMenu;
