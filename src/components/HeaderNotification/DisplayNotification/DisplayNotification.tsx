import {CloseOutlined} from '@ant-design/icons';
import {Badge} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {useNotifications} from '../../../hooks/NotificationsHook';
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

const CustomBadge = styled(Badge)`
    margin: 0 0.3rem;
    & > * {
        border: none;
        box-shadow: none;
    }
`;

interface IDisplayNotificationProps {
    message: INotification;
    activeTimeouts: {notification: any; base: any};
    cancelNotification: () => void;
}

function DisplayNotification({message, activeTimeouts, cancelNotification}: IDisplayNotificationProps): JSX.Element {
    const {notificationsStack} = useNotifications();
    return (
        <>
            <Wrapper>
                <span>{message.content}</span>
                <span>
                    {activeTimeouts.notification && (
                        <div>
                            <CustomBadge count={notificationsStack.length} />
                            <CloseOutlined onClick={cancelNotification} />
                        </div>
                    )}
                </span>
            </Wrapper>
        </>
    );
}

export default DisplayNotification;
