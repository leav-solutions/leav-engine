// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined, DownloadOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {useLang} from '@leav/ui';
import {Button, List, Popconfirm, Progress, Space, Tooltip, Typography} from 'antd';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {isCompletedTask, isExceptionTask, localizedTranslation} from 'utils';
import {TaskStatus} from '_gqlTypes/globalTypes';
import {getFileUrl} from '../../../utils';
import {INotif} from '../NotifsPanel';

const WrapperProgress = styled.div<{$isCanceled: boolean}>`
    & .ant-progress-text {
        color: ${props => (props.$isCanceled ? '#F2C037 !important' : '')};
    }
`;

const _getTaskDuration = (startedAt: number, completedAt: number): string => {
    const d = moment.duration(moment(completedAt).diff(moment(startedAt)));
    return `${d.hours() + 'h'} ${d.minutes() + 'm'} ${d.seconds() + 's'}`;
};

interface ITaskItemProps {
    notif: INotif;
    index: ['inProgress' | 'completed', number];
    onNotifInfoClick: (notif: INotif, index: ['inProgress' | 'completed', number]) => void;
    onCancel: (notif: INotif) => Promise<void>;
    onDelete: (notif: INotif) => Promise<void>;
}

function TaskItem({notif, index, onNotifInfoClick, onCancel, onDelete}: ITaskItemProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {ellipsis, data: task} = notif;

    return (
        <List.Item
            data-testid="itemList"
            key={task.id}
            extra={[
                <Tooltip key={`${task.id}infos`} title={t('notifications.task-infos')}>
                    <Button
                        type="link"
                        onClick={() => onNotifInfoClick(notif, index)}
                        shape="circle"
                        icon={<InfoCircleOutlined />}
                    />
                </Tooltip>,
                ...[
                    !isCompletedTask(task) ? (
                        <Popconfirm
                            key={`${task.id}PopConfirmDelBtn`}
                            placement="bottomRight"
                            title={t('notifications.task-confirmCancel')}
                            onConfirm={() => onCancel(notif)}
                            okText={t('global.yes')}
                            cancelText={t('global.no')}
                        >
                            <Button data-testid="cancelBtn" key={`${task.id}CancelBtn`} size={'small'}>
                                {t('notifications.task-cancel')}
                            </Button>{' '}
                        </Popconfirm>
                    ) : (
                        <Button
                            data-testid="deleteBtn"
                            key={`${task.id}DelBtn`}
                            icon={<DeleteOutlined />}
                            size={'small'}
                            onClick={() => onDelete(notif)}
                        />
                    )
                ]
            ]}
        >
            <List.Item.Meta
                avatar={
                    !!task.link ? (
                        <Button
                            key="download-file"
                            type="primary"
                            shape="circle"
                            icon={<DownloadOutlined />}
                            href={getFileUrl(task.link.url)}
                            size={'large'}
                        />
                    ) : (
                        <WrapperProgress $isCanceled={task.status === TaskStatus.CANCELED}>
                            <Progress
                                size={45}
                                type="circle"
                                percent={task.progress?.percent || 0}
                                {...(isExceptionTask(task) && {
                                    status: 'exception',
                                    ...(task.status === TaskStatus.CANCELED && {strokeColor: '#F2C037'})
                                })}
                            />
                        </WrapperProgress>
                    )
                }
                title={
                    <Typography.Text {...(ellipsis && {ellipsis: {tooltip: localizedTranslation(task.label, lang)}})}>
                        {localizedTranslation(task.label, lang)}
                    </Typography.Text>
                }
                description={
                    isCompletedTask(task) || !task.progress?.description
                        ? t(`notifications.task-status.${TaskStatus[task.status]}`)
                        : localizedTranslation(task.progress?.description, lang)
                }
            />
            {!ellipsis && (
                <Space style={{fontSize: 12}} direction="vertical" size={0} align={'baseline'}>
                    {!!task.startedAt ? (
                        <Typography.Text>
                            {`${t('notifications.task-startedAt')} ${new Date(task.startedAt * 1000).toLocaleString()}`}
                        </Typography.Text>
                    ) : (
                        <Typography.Text>
                            {`${t('notifications.task-startAt')} ${new Date(task.startAt * 1000).toLocaleString()}`}
                        </Typography.Text>
                    )}
                    {!!task.completedAt && (
                        <Typography.Text>
                            {`${t(
                                task.status === TaskStatus.CANCELED
                                    ? 'notifications.task-canceledAt'
                                    : 'notifications.task-completedAt'
                            )} ${new Date(task.completedAt * 1000).toLocaleString()}`}
                        </Typography.Text>
                    )}
                    {!!task.canceledBy && (
                        <Typography.Text>
                            {`${t('notifications.task-canceledBy')} ${task.canceledBy.whoAmI.label}`}
                        </Typography.Text>
                    )}
                    {!!task.completedAt && !isExceptionTask(task) && (
                        <Typography.Text>
                            {`${t('notifications.task-duration')}: ${_getTaskDuration(
                                task.startedAt,
                                task.completedAt
                            )}`}
                        </Typography.Text>
                    )}
                </Space>
            )}
        </List.Item>
    );
}

export default TaskItem;
