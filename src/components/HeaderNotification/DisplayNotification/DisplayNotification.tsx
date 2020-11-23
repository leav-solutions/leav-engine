import {CloseOutlined} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';
import {INotification} from '../../../_types/types';

const Wrapper = styled.div`
    padding: 0.3rem 1rem;
    min-width: 25%;
    width: auto;
    text-overflow: hidden;
    font-weight: 600;

    background: #0d1e26 0% 0% no-repeat padding-box;
    border: 1px solid #70707031;
    border-radius: 3px;

    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
`;

interface IDisplayNotificationProps {
    message: INotification;
    activeTimeouts: {notification: any; base: any};
    cancelNotification: () => void;
}

function DisplayNotification({message, activeTimeouts, cancelNotification}: IDisplayNotificationProps): JSX.Element {
    return (
        <Wrapper>
            <span>{message.content}</span>
            <span>{activeTimeouts.notification && <CloseOutlined onClick={cancelNotification} />}</span>
        </Wrapper>
    );
}

export default DisplayNotification;
