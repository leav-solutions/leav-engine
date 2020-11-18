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
    const [activeTimeouts, setActiveTimeouts] = useState<{notification: any; base: any}>({
        notification: null,
        base: null
    });

    useEffect(() => {
        if (notificationsStack.length) {
            // Sort notification by priority
            const sortNotificationsStack = [...notificationsStack].sort((a, b) => {
                const ap = a.priority ?? 0;
                const bp = b.priority ?? 0;

                return bp - ap;
            });

            // Take the first notification
            const [notification, ...restNotifications] = sortNotificationsStack;

            if (notification && !activeTimeouts.notification) {
                setMessage(notification);

                const notificationTime = notification.time ?? defaultNotificationsTime;

                if (activeTimeouts.base) {
                    clearTimeout(activeTimeouts.base);
                }

                // Reset notifications
                const notificationTimeout = setTimeout(() => {
                    if (!activeTimeouts.notification) {
                        const baseTimeout = setTimeout(() => {
                            setMessage(notificationBase);
                        }, 100);

                        setActiveTimeouts(at => ({
                            notification: at.notification,
                            base: baseTimeout
                        }));
                    }

                    setActiveTimeouts(at => ({
                        notification: null,
                        base: at.base
                    }));
                }, notificationTime);

                setActiveTimeouts(at => ({
                    notification: notificationTimeout,
                    base: at.base
                }));

                updateNotificationsStack(restNotifications);
            }
        } else if (!activeTimeouts.notification) {
            setMessage(msg => {
                if (notificationBase.content !== msg.content) {
                    return notificationBase;
                }
                return msg;
            });
        }
    }, [setMessage, updateNotificationsStack, notificationsStack, notificationBase, setActiveTimeouts, activeTimeouts]);

    return <Wrapper>{message.content}</Wrapper>;
}

export default HeaderNotification;
