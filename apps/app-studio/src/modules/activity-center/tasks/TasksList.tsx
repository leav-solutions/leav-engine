// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitEmpty, KitLoader, KitNotification, KitSpace} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {useGetUserTasks} from './user-tasks/useGetUserTasks';
import {activityCenterTabEmptyContent, activityCenterTabContent} from '../activityCenter.module.css';
import {useLang, useUser} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {getTaskDisplayData} from './getTaskDisplayData';

export const TasksList = () => {
    const {userData: me} = useUser();
    const {userTasks, loading, error} = useGetUserTasks(me?.userId);
    const {lang} = useLang();
    const {t} = useTranslation();

    const userHasTasks = userTasks?.length > 0;

    if (loading) {
        return (
            <div className={activityCenterTabEmptyContent}>
                <KitLoader />
            </div>
        );
    }

    if (error) {
        return (
            <KitEmpty
                className={activityCenterTabEmptyContent}
                image={KitEmpty.ASSET_TASKS_ERROR}
                title={t('error.title')}
                description={t('error.description')}
            />
        );
    }

    if (!userHasTasks) {
        return (
            <KitEmpty
                className={activityCenterTabEmptyContent}
                image={KitEmpty.ASSET_LIST}
                description={t('activity_center.tasks.no_tasks')}
            />
        );
    }

    return (
        <KitSpace className={activityCenterTabContent} direction="vertical" size="s">
            {userTasks?.map(task => {
                const {notificationType, notificationIcon, taskStatusTag, taskProgress, taskDurationInfo} =
                    getTaskDisplayData({task, t, lang});

                return (
                    <KitNotification
                        key={task.id}
                        type={notificationType}
                        icon={notificationIcon}
                        actionExtra={taskStatusTag}
                        message={localizedTranslation(task.label, lang)}
                        messageExtra={taskDurationInfo}
                        descriptionExtra={taskProgress}
                    />
                );
            })}
        </KitSpace>
    );
};
