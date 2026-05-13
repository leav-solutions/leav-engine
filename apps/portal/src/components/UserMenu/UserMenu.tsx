import {PreviewSize, RecordCard} from '@leav/ui';
import useUserData from '../../hooks/useUserData';
import {useState} from 'react';
import styled from 'styled-components';
import UserPanel from './UserPanel';

const Wrapper = styled.div`
    cursor: pointer;
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
            <RecordCard record={userData.whoAmI} withLibrary={false} size={PreviewSize.SMALL} />
            <UserPanel onClose={_handleClose} isVisible={isUserPanelVisible} />
        </Wrapper>
    );
}

export default UserMenu;
