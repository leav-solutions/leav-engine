// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useState} from 'react';
import {setNotificationStack} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {defaultNotificationsTime} from '../../constants/constants';
import {sortNotificationByPriority} from '../../utils';
import {INotification, NotificationChannel} from '../../_types/types';
import DisplayNotification from './DisplayNotification';

function HeaderNotification(): JSX.Element {
    const {stack, base} = useAppSelector(state => state.notification);
    const dispatch = useAppDispatch();

    const [message, setMessage] = useState<INotification>(base);
    const [triggerNotifications, setTriggerNotifications] = useState<INotification[]>([]);
    const [activeTimeouts, setActiveTimeouts] = useState<{notification: any; base: any}>({
        notification: null,
        base: null
    });

    useEffect(() => {
        const {passiveNotifications, triggerNotifications: triggerNotifs} = stack.reduce(
            (acc, notification) => {
                switch (notification.channel) {
                    case NotificationChannel.trigger:
                        return {...acc, triggerNotifications: [...acc.triggerNotifications, notification]};
                    case NotificationChannel.passive:
                    default:
                        return {...acc, passiveNotifications: [...acc.passiveNotifications, notification]};
                }
            },
            {
                passiveNotifications: [] as INotification[],
                triggerNotifications: [] as INotification[]
            }
        );

        if (triggerNotifs.length) {
            setTriggerNotifications(notifications => [...notifications, ...triggerNotifs]);

            dispatch(setNotificationStack(passiveNotifications));
        }

        if (passiveNotifications.length) {
            // Sort notification by priority
            const sortPassiveNotifications = [...passiveNotifications].sort(sortNotificationByPriority);

            // Take the first notification
            const [notification, ...restNotifications] = sortPassiveNotifications;

            if (notification && !activeTimeouts.notification) {
                setMessage(notification);

                const notificationTime = notification.time ?? defaultNotificationsTime;

                // if a timeout to show base notification is active, clear it
                if (activeTimeouts.base) {
                    setActiveTimeouts(timeouts => {
                        clearTimeout(timeouts.base);

                        return {
                            base: null,
                            notification: timeouts.notification
                        };
                    });
                }

                // at the end of the time given for the notification, display base message
                const notificationTimeout = setTimeout(() => {
                    if (!activeTimeouts.notification) {
                        // wait 100 to display base notification to avoid
                        // base message to appear between two notification
                        const baseTimeout = setTimeout(() => {
                            setMessage(base);
                        }, 100);

                        // set baseTimeout in state
                        setActiveTimeouts(timeouts => ({
                            notification: timeouts.notification,
                            base: baseTimeout
                        }));
                    }

                    // reset notification timeout in state
                    setActiveTimeouts(at => ({
                        notification: null,
                        base: at.base
                    }));
                }, notificationTime);

                // set the timeout for reset the notification in the state
                setActiveTimeouts(timeouts => ({
                    notification: notificationTimeout,
                    base: timeouts.base
                }));

                // update notification stack with rest notifications
                dispatch(setNotificationStack(restNotifications));
            }
        } else if (!activeTimeouts.notification) {
            // if no notification, display base notification
            setMessage(msg => {
                if (base.content !== msg.content) {
                    return base;
                }
                return msg;
            });
        }
    }, [setMessage, stack, base, setActiveTimeouts, activeTimeouts, dispatch]);

    const cancelNotification = () => {
        clearTimeout(activeTimeouts.notification);
        setActiveTimeouts(timeouts => ({
            notification: null,
            base: timeouts.base
        }));
    };

    return (
        <DisplayNotification
            message={message}
            activeTimeouts={activeTimeouts}
            cancelNotification={cancelNotification}
            triggerNotifications={triggerNotifications}
            setTriggerNotifications={setTriggerNotifications}
        />
    );
}

export default HeaderNotification;
