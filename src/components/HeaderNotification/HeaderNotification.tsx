import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {defaultNotificationsTime} from '../../constants/constants';
import {useNotificationsStack} from '../../hook/NotificationsStack';
import {INotification, NotificationType} from '../../_types/types';

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
    const {t} = useTranslation();

    const baseMessage = t('notification.base-message');

    const {notificationsStack, updateNotificationsStack} = useNotificationsStack();
    const [message, setMessage] = useState<INotification>({content: baseMessage, type: NotificationType.basic});

    useEffect(() => {
        if (notificationsStack.length) {
            const [notification, ...restNotifications] = notificationsStack;

            if (notification) {
                setMessage(notification);
                const notificationTime = notification.time ?? defaultNotificationsTime;

                // reset notifications
                setTimeout(() => {
                    setMessage({content: baseMessage, type: NotificationType.basic});
                }, notificationTime);

                updateNotificationsStack(restNotifications);
            }
        }
    }, [setMessage, t, updateNotificationsStack, notificationsStack, baseMessage]);

    return <Wrapper>{message.content}</Wrapper>;
}

export default HeaderNotification;
