// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {NotificationsList} from './notifications/NotificationsList';
import {useTranslation} from 'react-i18next';
import {TasksList} from './tasks/TasksList';
import {KitTabs} from 'aristid-ds';
import {type IKitTabItem} from 'aristid-ds/dist/Kit/DataDisplay/Tabs/types';
import {activityCenterTabs} from './activityCenter.module.css';
import {NotificationsList} from './notifications/NotificationsList';

export const ActivityCenter = () => {
    const {t} = useTranslation();

    const tabsItems: IKitTabItem[] = [
        {
            key: 'notifications',
            label: t('activity_center.notifications_title'),
            tabContent: <NotificationsList />,
        },
        {
            key: 'tasks',
            label: t('activity_center.long_tasks_title'),
            tabContent: <TasksList />,
        },
    ];

    return <KitTabs className={activityCenterTabs} defaultKey="tasks" items={tabsItems} />;
};
