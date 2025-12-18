// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitEmpty, KitLoader, KitModal, KitNotification, KitSpace} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {useGetUserTasks} from './get-user-tasks/useGetUserTasks';
import {useArchiveUserTasks} from './archive-user-tasks/useArchiveUserTasks';
import {
    activityCenterTabEmptyContent,
    activityCenterTabContent,
    activityCenterTabFooter,
} from '../activityCenter.module.css';
import {useLang, useUser} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {getTaskDisplayData} from './getTaskDisplayData';
import {type Task} from './types';
import {ERROR_NOTIFICATION_DURATION} from '_ui/constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {BREAK_TWO_LINES} from '_ui/components/Explorer/_constants';

export const TasksList = () => {
    const {userData: me} = useUser();
    const {userTasks, loading, error, removeTasks} = useGetUserTasks(me?.userId);
    const {archiveUserTasks} = useArchiveUserTasks();
    const {lang} = useLang();
    const {t} = useTranslation();

    const userHasTasks = userTasks?.length > 0;
    const userHasMultipleTasks = userTasks?.length > 1;

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

    const onArchiveUserTasks = async (tasks: Task[]) => {
        KitModal.confirm({
            width: '100%',
            style: {content: {width: '90vw', maxWidth: '656px'}},
            type: 'confirm',
            icon: false,
            title: t('activity_center.tasks.delete_task', {count: tasks?.length}),
            content:
                t('activity_center.tasks.delete_task_description', {count: tasks?.length}) +
                BREAK_TWO_LINES +
                t('global.are_you_sure'),
            okText: t('global.confirm'),
            cancelText: t('global.cancel'),
            onOk: async () => {
                try {
                    await archiveUserTasks(tasks);
                    // Tasks will be removed from userTasks list
                    removeTasks(tasks.map(task => task.id));
                } catch {
                    KitNotification.error({
                        message: t('error.title'),
                        description: t('error.description'),
                        duration: ERROR_NOTIFICATION_DURATION,
                        closable: true,
                    });
                }
            },
        });
    };

    return (
        <>
            <KitSpace className={activityCenterTabContent} direction="vertical" size="s">
                {userTasks?.map(task => {
                    const {
                        notificationType,
                        notificationIcon,
                        taskStatusTag,
                        taskProgress,
                        taskDurationInfo,
                        taskArchiveButton,
                    } = getTaskDisplayData({task, t, lang, onArchiveUserTasks});

                    return (
                        <KitNotification
                            key={task.id}
                            type={notificationType}
                            icon={notificationIcon}
                            actionExtra={
                                <>
                                    {taskStatusTag}
                                    {taskArchiveButton}
                                </>
                            }
                            message={localizedTranslation(task.label, lang)}
                            messageExtra={taskDurationInfo}
                            descriptionExtra={taskProgress}
                        />
                    );
                })}
            </KitSpace>
            {userHasMultipleTasks && (
                <div className={activityCenterTabFooter}>
                    <KitButton
                        type="secondary"
                        icon={<FontAwesomeIcon icon={faTrash} />}
                        onClick={() => onArchiveUserTasks(userTasks)}
                        danger
                    >
                        {t('activity_center.tasks.delete_all')}
                    </KitButton>
                </div>
            )}
        </>
    );
};
