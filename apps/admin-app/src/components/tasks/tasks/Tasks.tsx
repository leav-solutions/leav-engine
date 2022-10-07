// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery, useSubscription} from '@apollo/client';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import {History} from 'history';
import React from 'react';
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
import {DELETE_TASK, DELETE_TASKVariables} from '_gqlTypes/DELETE_TASK';
import {deleteTaskMutation} from 'queries/tasks/deleteTask';
import {CANCEL_TASK, CANCEL_TASKVariables} from '_gqlTypes/CANCEL_TASK';
import {cancelTaskMutation} from 'queries/tasks/cancelTask';

interface ILibrariesProps {
    history: History;
}

const Tasks = ({history}: ILibrariesProps): JSX.Element => {
    const {t} = useTranslation();
    const userData = useUserData();
    const currentApp = useCurrentApplicationContext();

    const dispatch = useAppDispatch();
    const {tasks} = useAppSelector(state => state.tasks);

    const {loading, error} = useQuery(getTasks, {
        variables: {
            filters: {
                created_by: userData?.id
            }
        },
        skip: !userData,
        onCompleted: tasksData => {
            for (const task of tasksData.tasks.list) {
                dispatch(addTask(task));
            }
        }
    });

    useSubscription(subTaskUpdates, {
        onSubscriptionData: subData => {
            // we temporary add created_by field because of miss context for subscriptions on server side to resolve User object
            const task = {...subData.subscriptionData.data.task, created_by: {id: 'toFix'}};
            dispatch(addTask(task));
        }
    });

    const _isInProgressTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING;
    const _isCompletedTask = (task: GET_TASKS_tasks_list) =>
        task.status === TaskStatus.CANCELED || task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED;

    const inProgressTasks = Object.values(tasks)
        .filter(_isInProgressTask)
        .sort((a, b) => a.startAt - b.startAt);

    const completedTasks = Object.values(tasks)
        .filter(_isCompletedTask)
        .sort((a, b) => b.startedAt - a.startedAt); // FIXME: add completedAt field in backend for failed/canceled tasks, then sort by completedAt

    const [delTask] = useMutation<DELETE_TASK, DELETE_TASKVariables>(deleteTaskMutation, {
        onCompleted: (data: DELETE_TASK) => {
            dispatch(deleteTask(data.deleteTask));
        }
    });

    const [cancelTask] = useMutation<CANCEL_TASK, CANCEL_TASKVariables>(cancelTaskMutation);

    const _onDeleteAll = () => {
        completedTasks.map(task => delTask({variables: {taskId: task.id}}));
    };

    const onDelete = (taskId: string) => {
        delTask({variables: {taskId}});
    };

    const onCancel = (taskId: string) => {
        cancelTask({variables: {taskId}});
    };

    const panes = [
        {
            menuItem: 'In progress',
            render: () => (
                <Tab.Pane>
                    <TasksList
                        striped
                        actionsBtn={task => [<CancelTask onCancel={onCancel} task={task} />]}
                        loading={loading || !inProgressTasks}
                        tasks={inProgressTasks}
                    />
                </Tab.Pane>
            )
        },
        {
            menuItem: 'Completed',
            render: () => (
                <Tab.Pane>
                    <TasksList
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
                            <Button secondary onClick={_onDeleteAll} floated="right" size="small">
                                {t('tasks.delete_all')}
                            </Button>
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
