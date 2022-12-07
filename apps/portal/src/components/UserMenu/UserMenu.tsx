// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordCard from 'components/shared/RecordCard';
import useUserData from 'hooks/useUserData';
import React, {useState} from 'react';
import styled from 'styled-components';
import UserPanel from './UserPanel';

const Wrapper = styled.div`
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 1rem;
`;

function UserMenu(): JSX.Element {
    const userData = useUserData();
    const [isUserPanelVisible, setIsUserPanelVisible] = useState<boolean>(false);

    const _toggleUserPanel = () => {
        setIsUserPanelVisible(!isUserPanelVisible);
    };

    const _handleClose = () => {
        setIsUserPanelVisible(false);
    };

    return (
        <Wrapper onClick={_toggleUserPanel}>
            <RecordCard record={userData.whoAmI} withLibrary={false} />
            <UserPanel onClose={_handleClose} isVisible={isUserPanelVisible} />
        </Wrapper>
    );
}

export default UserMenu;
