// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Divider, Drawer, List, Progress, Typography, Switch, Tooltip, Space} from 'antd';
import {useMutation} from '@apollo/client';
import {useAppSelector, useAppDispatch} from 'redux/store';
import moment from 'moment';
import {DownloadOutlined, DeleteOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {TaskStatus} from '_gqlTypes/globalTypes';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {CANCEL_TASK, CANCEL_TASKVariables} from '_gqlTypes/CANCEL_TASK';
import {DELETE_TASK, DELETE_TASKVariables} from '_gqlTypes/DELETE_TASK';
import {cancelTaskMutation} from 'graphQL/mutations/tasks/cancelTask';
import {getFileUrl} from '../../utils';
import styled from 'styled-components';
import {deleteTaskMutation} from 'graphQL/mutations/tasks/deleteTask';
import {deleteTask} from 'redux/tasks';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface INotifsPanelProps {
    notifsPanelVisible: boolean;
    hideNotifsPanel: () => void;
    setNbNotifs: (count: number) => void;
}

export enum NotifTypes {
    TASK = 'TASK'
}

export interface INotif {
    type: NotifTypes;
    ellipsis: boolean;
    data: any;
}

const WrapperProgress = styled.div<{isCanceled: boolean}>`
    & .ant-progress-text {
        color: ${props => (props.isCanceled ? '#F2C037 !important' : '')};
    }
`;

function NotifsPanel({notifsPanelVisible, hideNotifsPanel, setNbNotifs}: INotifsPanelProps): JSX.Element {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const {tasks} = useAppSelector(state => state.tasks);

    const [panel, setPanel] = useState<{inProgress: INotif[]; completed: INotif[]}>({inProgress: [], completed: []});

    const [runCancelTask] = useMutation<CANCEL_TASK, CANCEL_TASKVariables>(cancelTaskMutation);
    const [runDeleteTask] = useMutation<DELETE_TASK, DELETE_TASKVariables>(deleteTaskMutation, {
        onCompleted: (data: DELETE_TASK) => {
            dispatch(deleteTask(data.deleteTask));
        }
    });

    const _isInProgressTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING;
    const _isCompletedTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.CANCELED || task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED;
    const _isExceptionTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.CANCELED || task.status === TaskStatus.FAILED;

    useEffect(() => {
        setPanel({
            inProgress: Object.values(tasks)
                .filter(_isInProgressTask)
                .sort((a, b) => a.startAt - b.startAt)
                .map(task => ({type: NotifTypes.TASK, ellipsis: true, data: task})),
            completed: Object.values(tasks)
                .filter(_isCompletedTask)
                .sort((a, b) => b.startedAt - a.startedAt) // FIXME: add completedAt field in backend for failed/canceled tasks, then sort by completedAt
                .map(task => ({type: NotifTypes.TASK, ellipsis: true, data: task}))
        });

        setNbNotifs(panel.inProgress.length);
    }, [tasks, useAppSelector]);

    const _onCancel = async (task: GET_TASKS_tasks_list) => {
        await runCancelTask({
            variables: {taskId: task.id}
        });
    };

    const _onDelete = async (task: GET_TASKS_tasks_list) => {
        await runDeleteTask({
            variables: {taskId: task.id}
        });
    };

    const _onTaskInfoClick = ({type, ellipsis, data: task}: INotif, index: ['inProgress' | 'completed', number]) => {
        const list = [...panel[index[0]]];
        list[index[1]] = {type, ellipsis: !ellipsis, data: task};
        setPanel({
            inProgress: index[0] === 'inProgress' ? list : panel.inProgress,
            completed: index[0] === 'completed' ? list : panel.completed
        });
    };

    const _getTaskDuration = (startedAt: number, completedAt: number): string => {
        const d = moment.duration(moment(completedAt).diff(moment(startedAt)));
        return `${d.hours() + 'h'} ${d.minutes() + 'm'} ${d.seconds() + 's'}`;
    };

    const taskItem = ({type, ellipsis, data: task}: INotif, index: ['inProgress' | 'completed', number]) => {
        return (
            <List.Item
                data-testid="itemList"
                key={task.id}
                extra={[
                    <Tooltip key={`${task.id}infos`} title={t('notifications.task-infos')}>
                        <Button
                            type="link"
                            onClick={() => _onTaskInfoClick({type, ellipsis, data: task}, index)}
                            shape="circle"
                            icon={<InfoCircleOutlined />}
                        />
                    </Tooltip>,
                    ...[
                        !_isCompletedTask(task) ? (
                            <Button
                                data-testid="cancelBtn"
                                key={`${task.id}CancelBtn`}
                                size={'small'}
                                onClick={() => _onCancel(task)}
                            >
                                {t('notifications.task-cancel')}
                            </Button>
                        ) : (
                            <Button
                                data-testid="deleteBtn"
                                key={`${task.id}DelBtn`}
                                icon={<DeleteOutlined />}
                                size={'small'}
                                onClick={() => _onDelete(task)}
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
                            <WrapperProgress isCanceled={task.status === TaskStatus.CANCELED}>
                                <Progress
                                    width={45}
                                    type="circle"
                                    percent={task.progress?.percent || 0}
                                    {...(_isExceptionTask(task) && {
                                        status: 'exception',
                                        ...(task.status === TaskStatus.CANCELED && {strokeColor: '#F2C037'})
                                    })}
                                />
                            </WrapperProgress>
                        )
                    }
                    title={<Typography.Text ellipsis={ellipsis}>{task.name}</Typography.Text>}
                    description={
                        _isCompletedTask(task) || !task.progress?.description
                            ? t(`notifications.task-status.${TaskStatus[task.status]}`)
                            : task.progress?.description
                    }
                />
                {!ellipsis && (
                    <Space style={{fontSize: 12}} direction="vertical" size={0} align={'baseline'}>
                        <Typography.Text>
                            {`${t('notifications.task-createdAt')} ${new Date(
                                task.created_at * 1000
                            ).toLocaleString()}`}
                        </Typography.Text>
                        <Typography.Text>
                            {`${t('notifications.task-startAt')} ${new Date(task.startAt * 1000).toLocaleString()}`}
                        </Typography.Text>
                        {!!task.startedAt && (
                            <Typography.Text>
                                {`${t('notifications.task-startedAt')} ${new Date(
                                    task.startedAt * 1000
                                ).toLocaleString()}`}
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
                                {`${t('notifications.task-canceledBy')} ${task.canceledBy}`}
                            </Typography.Text>
                        )}
                        {!!task.completedAt && !_isExceptionTask(task) && (
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
    };

    return (
        <Drawer
            data-testid="drawer"
            title={t('notifications.title')}
            visible={notifsPanelVisible}
            onClose={hideNotifsPanel}
            placement="right"
            getContainer={false}
            bodyStyle={{padding: 0}}
        >
            {!!panel.inProgress.length && (
                <List
                    data-testid="inProgressList"
                    header={t('notifications.inProgress')}
                    dataSource={panel.inProgress}
                    bordered
                    itemLayout="vertical"
                    size="small"
                    renderItem={(item, index) => {
                        return item.type === NotifTypes.TASK ? taskItem(item, ['inProgress', index]) : <></>;
                    }}
                />
            )}
            {!!panel.inProgress.length && !!panel.completed.length && <Divider plain />}
            {!!panel.completed.length && (
                <List
                    data-testid="completedList"
                    header={t('notifications.done')}
                    dataSource={panel.completed}
                    bordered
                    itemLayout="vertical"
                    size="small"
                    renderItem={(item, index) => {
                        return item.type === NotifTypes.TASK ? taskItem(item, ['completed', index]) : <></>;
                    }}
                />
            )}
        </Drawer>
    );
}

export default NotifsPanel;
