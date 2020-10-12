import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {defaultNotificationsTime} from '../../constants/constants';
import {useNotificationBase} from '../../hook/NotificationBase';
import {useNotificationsStack} from '../../hook/NotificationsStack';
import {INotification} from '../../_types/types';

const Wrapper = styled.div`
    padding: 0.3rem 1rem;
    min-width: 25%;
    width: auto;
    text-overflow: hidden;
    font-weight: 600;

    background: #0d1e26 0% 0% no-repeat padding-box;
    border: 1px solid #70707031;
    border-radius: 3px;
`;

function HeaderNotification(): JSX.Element {
    const [notificationBase] = useNotificationBase();
    const [notificationsStack, updateNotificationsStack] = useNotificationsStack();

    const [message, setMessage] = useState<INotification>(notificationBase);
    const [activeTimers, setActiveTimers] = useState<boolean>(false);

    useEffect(() => {
        if (notificationsStack.length) {
            // Sort notification by priority
            const sortNotificationsStack = [...notificationsStack].sort((a, b) => {
                const ap = a.priority ?? 0;
                const bp = b.priority ?? 0;

                return bp - ap;
            });

            // take the first notification
            const [notification, ...restNotifications] = sortNotificationsStack;

            if (notification && !activeTimers) {
                setMessage(notification);

                const notificationTime = notification.time ?? defaultNotificationsTime;

                // reset notifications
                setTimeout(() => {
                    if (!activeTimers) {
                        setMessage(notificationBase);
                    }

                    setActiveTimers(false);
                }, notificationTime);

                setActiveTimers(true);

                updateNotificationsStack(restNotifications);
            }
        } else if (!activeTimers) {
            setMessage(msg => {
                if (notificationBase.content !== msg.content) {
                    return notificationBase;
                }
                return msg;
            });
        }
    }, [setMessage, updateNotificationsStack, notificationsStack, notificationBase, setActiveTimers, activeTimers]);

    return <Wrapper>{message.content}</Wrapper>;
}

export default HeaderNotification;
