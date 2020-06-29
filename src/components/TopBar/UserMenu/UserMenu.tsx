import {useQuery} from '@apollo/client';
import React from 'react';
import {Menu} from 'semantic-ui-react';
import {getUser} from '../../../queries/cache/user/userQuery';

function UserMenu(): JSX.Element {
    const {data: dataUser} = useQuery(getUser);
    const userName = dataUser?.userName ?? dataUser?.userId ?? '';

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
                alignItems: 'center',
                cursor: 'pointer'
            }}
        >
            <div style={nameIconStyle}>{iconContent}</div>
            <Menu.Item>{userName}</Menu.Item>
        </div>
    );
}

export default UserMenu;
