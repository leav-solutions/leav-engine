// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import {useUser} from '../../../hooks/UserHook/UserHook';

const Wrapper = styled.div`
    & {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        width: 8rem;
    }
`;

const CustomIcon = styled.div`
    & {
        flex-shrink: 0;
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
    const [user] = useUser();

    const iconContent = user?.userName.split(' ').map(word => word[0]);

    return (
        <Wrapper>
            <CustomIcon>{iconContent}</CustomIcon>
            <div>{user?.userName}</div>
        </Wrapper>
    );
}

export default UserMenu;
