// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Divider, Drawer, List, Space, Button, Row, Col} from 'antd';
import {useMutation} from '@apollo/client';
import {useAppSelector, useAppDispatch} from 'redux/store';
import {CANCEL_TASK, CANCEL_TASKVariables} from '_gqlTypes/CANCEL_TASK';
import {DELETE_TASK, DELETE_TASKVariables} from '_gqlTypes/DELETE_TASK';
import {cancelTaskMutation} from 'graphQL/mutations/tasks/cancelTask';
import {deleteTaskMutation} from 'graphQL/mutations/tasks/deleteTask';
import {deleteTask} from 'redux/tasks';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import TaskItem from './TaskItem';
import {isInProgressTask, isCompletedTask} from './TaskItem/TaskItem';
import {setIsPanelOpen} from 'redux/notifications';
import styled from 'styled-components';

interface INotifsPanelProps {
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

function NotifsPanel({setNbNotifs}: INotifsPanelProps): JSX.Element {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const {tasks} = useAppSelector(state => state.tasks);
    const {isPanelOpen} = useAppSelector(state => state.notifications);

    const [panel, setPanel] = useState<{inProgress: INotif[]; completed: INotif[]}>({inProgress: [], completed: []});

    const [runCancelTask] = useMutation<CANCEL_TASK, CANCEL_TASKVariables>(cancelTaskMutation);
    const [runDeleteTask] = useMutation<DELETE_TASK, DELETE_TASKVariables>(deleteTaskMutation, {
        onCompleted: (data: DELETE_TASK) => {
            dispatch(deleteTask(data.deleteTask));
        }
    });

    const _onClose = () => {
        dispatch(setIsPanelOpen(false));
    };

    useEffect(() => {
        setPanel({
            inProgress: Object.values(tasks)
                .filter(isInProgressTask)
                .sort((a, b) => a.startAt - b.startAt)
                .map(task => ({type: NotifTypes.TASK, ellipsis: true, data: task})),
            completed: Object.values(tasks)
                .filter(isCompletedTask)
                .sort((a, b) => b.completedAt - a.completedAt)
                .map(task => ({type: NotifTypes.TASK, ellipsis: true, data: task}))
        });

        setNbNotifs(panel.inProgress.length);
    }, [tasks, useAppSelector]);

    const _onCancel = async (notif: INotif) => {
        if (notif.type === NotifTypes.TASK) {
            await runCancelTask({
                variables: {taskId: notif.data.id}
            });
        }
    };

    const _onDelete = async (notif: INotif) => {
        if (notif.type === NotifTypes.TASK) {
            await runDeleteTask({
                variables: {taskId: notif.data.id, archive: true}
            });
        }
    };

    const _onDeleteAll = async () => {
        for (const n of panel.completed) {
            if (n.type === NotifTypes.TASK) {
                await runDeleteTask({
                    variables: {taskId: n.data.id, archive: true}
                });
            }
        }
    };

    const _onNotifInfoClick = ({type, ellipsis, data: task}: INotif, index: ['inProgress' | 'completed', number]) => {
        const list = [...panel[index[0]]];
        list[index[1]] = {type, ellipsis: !ellipsis, data: task};
        setPanel({
            inProgress: index[0] === 'inProgress' ? list : panel.inProgress,
            completed: index[0] === 'completed' ? list : panel.completed
        });
    };

    return (
        <Drawer
            data-testid="drawer"
            title={t('notifications.title')}
            visible={isPanelOpen}
            onClose={_onClose}
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
                    renderItem={(notif, index) =>
                        notif.type === NotifTypes.TASK ? (
                            <TaskItem
                                key={`inProgressTask${index}`}
                                notif={notif}
                                index={['inProgress', index]}
                                onNotifInfoClick={_onNotifInfoClick}
                                onCancel={_onCancel}
                                onDelete={_onDelete}
                            />
                        ) : (
                            <></>
                        )
                    }
                />
            )}
            {!!panel.inProgress.length && !!panel.completed.length && <Divider plain />}
            {!!panel.completed.length && (
                <List
                    data-testid="completedList"
                    header={
                        <Row justify="space-between" align="bottom">
                            <Col>{t('notifications.done')}</Col>
                            <Col>
                                <Button size={'small'} onClick={_onDeleteAll}>
                                    {t('notifications.deleteAll')}
                                </Button>
                            </Col>
                        </Row>
                    }
                    dataSource={panel.completed}
                    bordered
                    itemLayout="vertical"
                    size="small"
                    renderItem={(notif: INotif, index) =>
                        notif.type === NotifTypes.TASK ? (
                            <TaskItem
                                key={`completedTask${index}`}
                                notif={notif}
                                index={['completed', index]}
                                onNotifInfoClick={_onNotifInfoClick}
                                onCancel={_onCancel}
                                onDelete={_onDelete}
                            />
                        ) : (
                            <></>
                        )
                    }
                />
            )}
        </Drawer>
    );
}

export default NotifsPanel;
