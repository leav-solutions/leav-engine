import React from 'react';
import {Icon, Input, Menu} from 'semantic-ui-react';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
}

function TopBar({toggleSidebarVisible}: ITopBarProps): JSX.Element {
    const nameIconStyle = {
        borderRadius: '50%',
        background: 'hsl(145, 100%, 50%)',
        color: '#FFFFFF',
        height: '2rem',
        width: '2rem',
        display: 'flex',
        flexDirection: 'column' as 'column',
        justifyContent: 'center',
        textAlign: 'center' as 'center',
        margin: '0 1rem',
        fontWeight: 'bold' as 'bold'
    };

    return (
        <Menu inverted style={{borderRadius: 0, margin: 0}}>
            <Menu.Menu>
                <Menu.Item name="toggle-sidebar" icon="grid layout" content="" onClick={toggleSidebarVisible} />
                <Menu.Item name="Library name" />
            </Menu.Menu>
            <Menu.Menu position="right">
                <Menu.Item>
                    <Input icon="search" placeholder="Search..." />
                </Menu.Item>
            </Menu.Menu>

            <Menu.Menu>
                <Menu.Item name="Shortcuts" icon="share square" />
                <Menu.Item name="Events" icon="bell" />
            </Menu.Menu>

            <Menu.Menu>
                <Menu.Item>
                    <div style={nameIconStyle}>NU</div>
                    <div>Name User</div>
                    <Icon name="angle down" />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );
}

export default TopBar;
