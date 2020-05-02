import React from 'react';
import {Icon, Menu} from 'semantic-ui-react';

interface ITopBarProps {
    toggleSidebarVisible: () => void;
}

function TopBar({toggleSidebarVisible}: ITopBarProps): JSX.Element {
    const nameIconStyle = {
        borderRadius: '50%',
        background: 'hsl(130, 52%, 58%)',
        color: '#FFFFFF',
        height: '2rem',
        width: '2rem',
        display: 'flex',
        flexDirection: 'column' as 'column',
        justifyContent: 'center',
        textAlign: 'center' as 'center',
        margin: '0 1rem',
        fontWeight: 'bold' as 'bold',
        fontSize: '.8rem'
    };

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
