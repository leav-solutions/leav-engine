// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Badge, message as antMessage} from 'antd';
import React, {useEffect} from 'react';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {INotification, NotificationType} from '../../../_types/types';

const Wrapper = styled.div`
    padding: 0.3rem 1rem;
    min-width: 25%;
    width: auto;
    text-overflow: hidden;
    font-weight: 600;
    line-height: 1em;

    background: #0d1e26 0% 0% no-repeat padding-box;
    border: 1px solid #70707031;
    border-radius: 3px;

    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    height: 3.5ch;
    white-space: nowrap;
    text-overflow: ellipsis;
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
    triggerNotifications: INotification[];
    setTriggerNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}

function DisplayNotification({
    message,
    activeTimeouts,
    cancelNotification,
    triggerNotifications,
    setTriggerNotifications
}: IDisplayNotificationProps): JSX.Element {
    const {stack} = useAppSelector(state => ({stack: state.notification.stack}));

    useEffect(() => {
        if (triggerNotifications.length) {
            const [notification, ...restNotifications] = triggerNotifications;

            switch (notification.type) {
                case NotificationType.error:
                    antMessage.error(notification.content);
                    break;
                case NotificationType.success:
                    antMessage.success(notification.content);
                    break;
                case NotificationType.warning:
                    antMessage.warning(notification.content);
                    break;
                case NotificationType.basic:
                default:
                    antMessage.info(notification.content);
                    break;
            }

            setTriggerNotifications(restNotifications);
        }
    }, [triggerNotifications, setTriggerNotifications]);

    return (
        <>
            <Wrapper data-testid="notification-message-wrapper">
                <Message notification={message} />
                <span>
                    {activeTimeouts.notification && (
                        <div>
                            <CustomBadge count={stack.length} />
                            <CloseOutlined onClick={cancelNotification} />
                        </div>
                    )}
                </span>
            </Wrapper>
        </>
    );
}

const ErrorMessage = styled.span`
    color: #e02020;
    font-weight: 800;
`;

const WarningMessage = styled.span`
    color: orange;
    font-weight: 600;
`;

const SuccessMessage = styled.span`
    color: greenyellow;
    font-weight: 600;
`;

const Message = ({notification}: {notification: INotification}) => {
    switch (notification.type) {
        case NotificationType.error:
            return <ErrorMessage>{notification.content}</ErrorMessage>;
        case NotificationType.warning:
            return <WarningMessage>{notification.content}</WarningMessage>;
        case NotificationType.success:
            return <SuccessMessage>{notification.content}</SuccessMessage>;
        case NotificationType.basic:
        default:
            return <span>{notification.content}</span>;
    }
};

export default DisplayNotification;
