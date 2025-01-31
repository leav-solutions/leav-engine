// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordCard, useUser} from '@leav/ui';
import styled from 'styled-components';
import {PreviewSize} from '_types/types';

const Wrapper = styled.div`
    & {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        width: 12rem;
    }
`;

function UserMenu(): JSX.Element {
    const {userData} = useUser();

    if (!userData) {
        return null;
    }

    return (
        <Wrapper>
            <RecordCard record={userData.userWhoAmI} size={PreviewSize.tiny} withLibrary={false} />
        </Wrapper>
    );
}

export default UserMenu;
