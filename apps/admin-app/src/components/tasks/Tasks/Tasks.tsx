// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery, useSubscription} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Header, Icon, Tab} from 'semantic-ui-react';
import useUserData from '../../../hooks/useUserData';
import {TaskStatus} from '../../../_gqlTypes/globalTypes';
import TasksList from '../TasksList';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {getTasks} from '../../../queries/tasks/getTasks';
import {subTaskUpdates} from '../../../queries/tasks/subTaskUpdates';
import {addTask, deleteTask} from 'redux/tasks/tasks';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import DeleteTask from '../DeleteTask';
import CancelTask from '../CancelTask';
import DeleteAllTasks from '../DeleteAllTasks';
import {DELETE_TASK, DELETE_TASKVariables} from '_gqlTypes/DELETE_TASK';
import {deleteTaskMutation} from 'queries/tasks/deleteTask';
import {CANCEL_TASK, CANCEL_TASKVariables} from '_gqlTypes/CANCEL_TASK';
import {cancelTaskMutation} from 'queries/tasks/cancelTask';

export type Column =
    | 'id'
    | 'label'
    | 'created_by'
    | 'created_at'
    | 'startAt'
    | 'startedAt'
    | 'canceledBy'
    | 'completedAt'
    | 'progress'
    | 'step'
    | 'duration'
    | 'archive';

const Tasks = (): JSX.Element => {
    const {t} = useTranslation();
    const userData = useUserData();

    const dispatch = useAppDispatch();
    const {tasks} = useAppSelector(state => state.tasks);

    const [inProgressTasks, setInProgressTasks] = useState<GET_TASKS_tasks_list[]>([]);
    const [completedTasks, setCompletedTasks] = useState<GET_TASKS_tasks_list[]>([]);

    const {loading, error} = useQuery(getTasks, {
        skip: !userData,
        onCompleted: tasksData => {
            for (const task of tasksData.tasks.list) {
                dispatch(addTask(task));
            }
        }
    });

    useSubscription(subTaskUpdates, {
        onSubscriptionData: subData => {
            const task = {...subData.subscriptionData.data.task};
            dispatch(addTask(task));
        }
    });

    const _isInProgressTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING;
    const _isCompletedTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.CANCELED || task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED;

    useEffect(() => {
        if (!!tasks) {
            setInProgressTasks(
                Object.values(tasks)
                    .filter(_isInProgressTask)
                    .sort((a, b) => a.startAt - b.startAt)
            );

            setCompletedTasks(
                Object.values(tasks)
                    .filter(_isCompletedTask)
                    .sort((a, b) => b.completedAt - a.completedAt)
            );
        }
    }, [tasks]);

    const [delTask] = useMutation<DELETE_TASK, DELETE_TASKVariables>(deleteTaskMutation, {
        onCompleted: (data: DELETE_TASK) => {
            dispatch(deleteTask(data.deleteTask));
        }
    });

    const [cancelTask] = useMutation<CANCEL_TASK, CANCEL_TASKVariables>(cancelTaskMutation);

    const _onDeleteAll = (archivesOnly: boolean = false) => {
        for (const task of completedTasks) {
            if (!archivesOnly || (archivesOnly && task.archive)) {
                delTask({variables: {taskId: task.id, archive: false}});
            }
        }
    };

    const onDelete = (taskId: string) => {
        delTask({variables: {taskId, archive: false}});
    };

    const onCancel = (taskId: string) => {
        cancelTask({variables: {taskId}});
    };

    const panes = [
        {
            menuItem: t('tasks.in_progress'),
            render: () => (
                <Tab.Pane>
                    <TasksList
                        enabledColumns={[
                            'id',
                            'label',
                            'created_by',
                            'created_at',
                            'startAt',
                            'startedAt',
                            'progress',
                            'step',
                            'duration'
                        ]}
                        striped
                        actionsBtn={task => [<CancelTask onCancel={onCancel} task={task} />]}
                        loading={loading || !inProgressTasks}
                        tasks={inProgressTasks}
                    />
                </Tab.Pane>
            )
        },
        {
            menuItem: t('tasks.completed'),
            render: () => (
                <Tab.Pane>
                    <TasksList
                        enabledColumns={[
                            'id',
                            'label',
                            'created_by',
                            'created_at',
                            'startAt',
                            'startedAt',
                            'canceledBy',
                            'completedAt',
                            'progress',
                            'step',
                            'duration',
                            'archive'
                        ]}
                        actionsBtn={task => [
                            ...(!!task.link
                                ? [
                                      <Button
                                          basic
                                          color="blue"
                                          key="download-file"
                                          icon="download"
                                          href={task.link.url}
                                      />
                                  ]
                                : []),
                            <DeleteTask onDelete={onDelete} task={task} />
                        ]}
                        loading={loading || !completedTasks}
                        tasks={completedTasks}
                        footerBtn={[
                            <DeleteAllTasks
                                confirmMessage={t('tasks.confirm_delete_all')}
                                label={t('tasks.delete_all')}
                                key="btn-delAll"
                                onDeleteAll={_onDeleteAll}
                            />,
                            <DeleteAllTasks
                                confirmMessage={t('tasks.confirm_delete_all_archives')}
                                label={t('tasks.delete_archives')}
                                key="btn-delAll"
                                onDeleteAll={() => _onDeleteAll(true)}
                            />
                        ]}
                    />
                </Tab.Pane>
            )
        }
    ];

    return (
        <>
            <Header size="large">
                <Icon name="tasks" />
                {t('tasks.title')}
            </Header>
            {typeof error !== 'undefined' ? <p>Error: {error.message}</p> : <Tab panes={panes} />}
        </>
    );
};

export default Tasks;
