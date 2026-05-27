import {type TFunction} from 'i18next';
import {type GetUserTasksQuery, TaskStatus} from '../../../__generated__';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClock, faSpinner, faBan, faTimes, faDownload} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitIdCard, KitProgress, KitSpace, KitTag, KitTooltip, KitTypography} from 'aristid-ds';
import {activityCenterTag} from '../activityCenter.module.css';
import {type IKitNotification} from 'aristid-ds/dist/Kit/Feedback/Notification/types';
import {type ReactNode} from 'react';
import {type Task} from './types';

interface ITaskDisplayData {
    notificationType: IKitNotification['type'];
    notificationIcon?: IKitNotification['icon'];
    taskStatusTag: ReactNode;
    taskProgress: ReactNode;
    taskDurationInfo: ReactNode;
    taskArchiveButton?: ReactNode;
    taskDownloadButton?: ReactNode;
}

const formatDate = (timestamp: number, lang: string[]): string =>
    new Date(timestamp * 1_000).toLocaleString(lang, {
        dateStyle: 'short',
        timeStyle: 'short',
    });

const formatDuration = (startedAt: number, completedAt: number | null, t: TFunction): string | null => {
    if (!completedAt) {
        return null;
    }

    const durationInMinutes = Math.floor((completedAt - startedAt) / 60);

    if (durationInMinutes < 1) {
        return t('activity_center.tasks.duration_less_than_minute');
    }

    if (durationInMinutes >= 60) {
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        return t('activity_center.tasks.duration_hours_minutes', {hours, minutes});
    }

    return t('activity_center.tasks.duration_minutes', {minutes: durationInMinutes});
};

const buildDurationInfo = (
    startedAt: number | null,
    completedAt: number | null,
    t: TFunction,
    lang: string[],
): ReactNode => {
    const duration = startedAt ? formatDuration(startedAt, completedAt, t) : null;

    return (
        <KitSpace direction="vertical" size="none">
            {startedAt && (
                <KitTypography.Text size="fontSize7">
                    {t('activity_center.tasks.started_at')} {formatDate(startedAt, lang)}
                </KitTypography.Text>
            )}
            {completedAt && (
                <KitTypography.Text size="fontSize7">
                    {t('activity_center.tasks.completed_at')} {formatDate(completedAt, lang)}
                </KitTypography.Text>
            )}
            {duration && (
                <KitTypography.Text size="fontSize7">
                    {t('activity_center.tasks.duration')} {duration}
                </KitTypography.Text>
            )}
        </KitSpace>
    );
};

const buildArchiveUserTaskButton = (
    task: Task,
    onArchiveUserTasks: (tasks: Task[]) => void,
    t: TFunction,
): ReactNode => (
    <KitTooltip title={t('global.delete')}>
        <KitButton
            type="tertiary"
            size="s"
            icon={<FontAwesomeIcon icon={faTimes} />}
            aria-label={t('global.delete')}
            onClick={() => onArchiveUserTasks([task])}
        />
    </KitTooltip>
);

const buildDownloadTaskButton = (task: Task, t: TFunction): ReactNode =>
    task.link?.url ? (
        <KitButton
            type="secondary"
            size="m"
            icon={<FontAwesomeIcon icon={faDownload} />}
            onClick={() => window.open(task.link?.url, '_blank')}
        >
            {t('global.download')}
        </KitButton>
    ) : undefined;

export const getTaskDisplayData = ({
    task,
    t,
    lang,
    onArchiveUserTasks,
}: {
    task: GetUserTasksQuery['tasks']['list'][number];
    t: TFunction;
    lang: string[];
    onArchiveUserTasks: (tasks: Task[]) => void;
}): ITaskDisplayData => {
    const percent = task.progress?.percent ?? 0;
    const hasProgress = percent > 0;

    switch (task.status) {
        case TaskStatus.CREATED:
        case TaskStatus.PENDING:
            return {
                notificationType: 'neutral',
                notificationIcon: <FontAwesomeIcon icon={faClock} />,
                taskStatusTag: (
                    <KitTag className={activityCenterTag} type="neutral">
                        <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                    </KitTag>
                ),
                taskProgress: (
                    <KitProgress
                        label={t('activity_center.progress')}
                        percent={percent}
                        strokeColor="var(--general-utilities-neutral-dark)"
                    />
                ),
                taskDurationInfo: null,
            };
        case TaskStatus.RUNNING:
            return {
                notificationType: 'info',
                notificationIcon: <FontAwesomeIcon icon={faSpinner} />,
                taskStatusTag: (
                    <KitTag className={activityCenterTag} type="secondary">
                        <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                    </KitTag>
                ),
                taskProgress: <KitProgress label={t('activity_center.progress')} percent={percent} />,
                taskDurationInfo: buildDurationInfo(task.startedAt, null, t, lang),
            };
        case TaskStatus.PENDING_CANCEL:
            return {
                notificationType: 'neutral',
                notificationIcon: hasProgress ? undefined : <FontAwesomeIcon icon={faBan} />,
                taskStatusTag: (
                    <KitTag className={activityCenterTag} type="neutral">
                        <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                    </KitTag>
                ),
                taskProgress: (
                    <KitProgress
                        label={t('activity_center.progress')}
                        percent={percent}
                        strokeColor="var(--general-utilities-neutral-dark)"
                    />
                ),
                taskDurationInfo: hasProgress ? buildDurationInfo(task.startedAt, task.completedAt, t, lang) : null,
            };
        case TaskStatus.CANCELED:
            return hasProgress
                ? {
                      notificationType: 'warning',
                      taskStatusTag: (
                          <KitTag className={activityCenterTag} type="neutral">
                              <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                          </KitTag>
                      ),
                      taskProgress: (
                          <KitProgress
                              label={t('activity_center.progress')}
                              percent={percent}
                              strokeColor="var(--general-utilities-warning-default)"
                          />
                      ),
                      taskDurationInfo: buildDurationInfo(task.startedAt, task.completedAt, t, lang),
                      taskArchiveButton: buildArchiveUserTaskButton(task, onArchiveUserTasks, t),
                      taskDownloadButton: buildDownloadTaskButton(task, t),
                  }
                : {
                      notificationType: 'neutral',
                      notificationIcon: <FontAwesomeIcon icon={faBan} />,
                      taskStatusTag: (
                          <KitTag className={activityCenterTag} type="neutral">
                              <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                          </KitTag>
                      ),
                      taskProgress: (
                          <KitProgress
                              label={t('activity_center.progress')}
                              percent={percent}
                              strokeColor="var(--general-utilities-neutral-dark)"
                          />
                      ),
                      taskDurationInfo: null,
                      taskArchiveButton: buildArchiveUserTaskButton(task, onArchiveUserTasks, t),
                      taskDownloadButton: buildDownloadTaskButton(task, t),
                  };
        case TaskStatus.DONE:
            return {
                notificationType: 'success',
                taskStatusTag: (
                    <KitTag className={activityCenterTag} type="success">
                        <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                    </KitTag>
                ),
                taskProgress: (
                    <KitProgress
                        label={t('activity_center.progress')}
                        percent={percent}
                        strokeColor="var(--general-utilities-success-default)"
                    />
                ),
                taskDurationInfo: buildDurationInfo(task.startedAt, task.completedAt, t, lang),
                taskArchiveButton: buildArchiveUserTaskButton(task, onArchiveUserTasks, t),
                taskDownloadButton: buildDownloadTaskButton(task, t),
            };
        case TaskStatus.FAILED:
            return {
                notificationType: 'error',
                taskStatusTag: (
                    <KitTag className={activityCenterTag} type="error">
                        <KitIdCard description={t(`activity_center.tasks.status.${task.status}`)} />
                    </KitTag>
                ),
                taskProgress: (
                    <KitProgress
                        label={t('activity_center.progress')}
                        percent={percent}
                        strokeColor="var(--general-utilities-error-default)"
                    />
                ),
                taskDurationInfo: buildDurationInfo(task.startedAt, task.completedAt, t, lang),
                taskArchiveButton: buildArchiveUserTaskButton(task, onArchiveUserTasks, t),
                taskDownloadButton: buildDownloadTaskButton(task, t),
            };
    }
};
