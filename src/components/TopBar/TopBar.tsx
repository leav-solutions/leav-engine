import React from 'react';
import {Menu} from 'semantic-ui-react';
import UserMenu from './UserMenu';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
}

function TopBar({toggleSidebarVisible}: ITopBarProps): JSX.Element {
    return (
        <Menu inverted style={{borderRadius: 0, margin: 0}}>
            <Menu.Menu>
                <Menu.Item name="toggle-sidebar" icon="grid layout" content="" onClick={toggleSidebarVisible} />
                <Menu.Item name="Name" content="Explorer" />
            </Menu.Menu>

            <Menu.Menu position="right">
                <Menu.Item name="Shortcuts" icon="share square" />
                <Menu.Item name="Events" icon="bell" />
            </Menu.Menu>

            <Menu.Menu>
                <UserMenu />
            </Menu.Menu>
        </Menu>
    );
}

export default TopBar;
