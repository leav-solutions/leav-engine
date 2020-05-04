import React from 'react';
import {Dropdown, Menu} from 'semantic-ui-react';

function UserMenu(): JSX.Element {
    const userName = 'Name User';
    const iconContent = userName.split(' ').map(word => word[0]);

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
        fontWeight: 'bold' as 'bold',
        fontSize: '.8rem'
    };

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center'
            }}
        >
            <div style={nameIconStyle}>{iconContent}</div>
            <Dropdown item as={Menu.Item} text={userName}>
                <Dropdown.Menu>
                    <Dropdown.Item>Profil</Dropdown.Item>
                    <Dropdown.Item>Tacks</Dropdown.Item>
                    <Dropdown.Item>Shortcuts</Dropdown.Item>
                    <Dropdown.Item>Events</Dropdown.Item>
                    <Dropdown.Item>Admin</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Header>LEAV-Engine 4.1</Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item icon="log out" text="Logout" />
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export default UserMenu;
