import React from 'react';
import {Input, Menu} from 'semantic-ui-react';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
}

function TopBar({toggleSidebarVisible}: ITopBarProps): JSX.Element {
    return (
        <Menu inverted style={{borderRadius: 0, margin: 0}}>
            <Menu.Menu>
                <Menu.Item name="toggle-sidebar" icon="sidebar" content="" onClick={toggleSidebarVisible} />
                <Menu.Item name="Library name" />
            </Menu.Menu>
            <Menu.Menu position="right">
                <Menu.Item>
                    <Input icon="search" placeholder="Search..." />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );
}

export default TopBar;
