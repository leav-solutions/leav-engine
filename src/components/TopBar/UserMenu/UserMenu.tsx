import {useQuery} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';
import {getUser} from '../../../queries/cache/user/userQuery';

const Wrapper = styled.div`
    & {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        width: 5rem;
    }
`;

const CustomIcon = styled.div`
    & {
        border-radius: 50%;
        background: hsl(130, 52%, 58%);
        color: #ffffff;
        height: 2rem;
        width: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        font-weight: bold;
        font-size: 0.8rem;
    }
`;

function UserMenu(): JSX.Element {
    const {data: dataUser} = useQuery(getUser);
    const userName = dataUser?.userName ?? dataUser?.userId ?? '';

    const iconContent = userName.split(' ').map(word => word[0]);

    return (
        <Wrapper>
            <CustomIcon>{iconContent}</CustomIcon>
            <div>{userName}</div>
        </Wrapper>
    );
}

export default UserMenu;
